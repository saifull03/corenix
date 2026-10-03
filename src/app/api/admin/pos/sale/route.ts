import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, withTransaction } from '@/lib/db';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      branchId: requestedBranchId,
      items,
      customerName = 'Walk-in Customer',
      customerPhone = '01700000000',
      customerEmail = '',
      customerAddress = '',
      paymentMethod = 'cash_pos',
      discountAmount = 0,
      taxAmount = 0,
      notes = '',
      idempotencyKey,
    } = body;

    // 1. Branch Authorization Check
    let branchId = requestedBranchId ? Number(requestedBranchId) : null;
    if (!isSuperAdmin(user)) {
      if (user.branch_id) {
        branchId = user.branch_id;
      } else {
        branchId = branchId || 2;
      }
    }
    if (!branchId) {
      branchId = 2; // Default to Shop 1
    }

    // Verify branch exists and is active
    const branch = await queryOne<any>(`SELECT * FROM branches WHERE id = ? AND is_active = 1`, [branchId]);
    if (!branch) {
      return NextResponse.json({ success: false, error: 'Invalid or inactive branch selected' }, { status: 400 });
    }

    // 2. Validate Cart
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cannot checkout with an empty sale ticket' }, { status: 400 });
    }

    // 3. Serial Uniqueness & Stock Validation Checks
    const seenSerials = new Set<string>();
    for (const item of items) {
      if (item.serialNumber && typeof item.serialNumber === 'string') {
        const sn = item.serialNumber.trim().toUpperCase();
        if (seenSerials.has(sn)) {
          return NextResponse.json(
            { success: false, error: `Duplicate serial number detected in cart: ${sn}. Each serial number can only be sold once.` },
            { status: 400 }
          );
        }
        seenSerials.add(sn);
      }
    }

    // Process & Verify each item against database
    const validatedItems: any[] = [];
    let calculatedSubtotal = 0;
    let calculatedCogsTotal = 0;

    for (const item of items) {
      const isOtherHouse = Boolean(item.isOtherHouse || (typeof item.id === 'string' && item.id.startsWith('oh-')));

      if (isOtherHouse) {
        // Look up Other House purchase record
        const ohId = item.originalOhId || (typeof item.id === 'string' ? Number(item.id.replace('oh-', '')) : Number(item.id));
        const ohRecord = await queryOne<any>(
          `SELECT * FROM other_house_purchases WHERE id = ? AND branch_id = ?`,
          [ohId, branchId]
        );

        if (!ohRecord) {
          return NextResponse.json(
            { success: false, error: `Other House item "${item.name}" not found in this branch.` },
            { status: 404 }
          );
        }

        if (ohRecord.status !== 'in_stock') {
          return NextResponse.json(
            { success: false, error: `Other House item "${ohRecord.product_name}" (SN: ${ohRecord.serial_number}) is already sold or unavailable.` },
            { status: 400 }
          );
        }

        const unitPrice = Number(item.customUnitPrice || ohRecord.selling_price || Math.round(Number(ohRecord.unit_cost) * 1.08));
        const unitCost = Number(ohRecord.unit_cost);
        const qty = 1;

        calculatedSubtotal += unitPrice * qty;
        calculatedCogsTotal += unitCost * qty;

        validatedItems.push({
          isOtherHouse: true,
          ohId: ohRecord.id,
          productId: ohRecord.product_id || 1,
          productName: ohRecord.product_name,
          sku: ohRecord.tracking_number,
          barcode: ohRecord.serial_number,
          serialNumber: ohRecord.serial_number,
          unitPrice,
          unitCost,
          quantity: qty,
          totalPrice: unitPrice * qty,
          totalCost: unitCost * qty,
          warrantyDetails: ohRecord.warranty_period || '1 Year Official Warranty',
          houseName: ohRecord.house_name,
        });
      } else {
        // Regular Product
        const productId = Number(item.productId || item.id);
        const product = await queryOne<any>(
          `SELECT p.*, COALESCE(inv.quantity, 0) as branch_stock, COALESCE(inv.reserved_qty, 0) as reserved_qty
           FROM products p
           LEFT JOIN inventory inv ON p.id = inv.product_id AND inv.branch_id = ?
           WHERE p.id = ? AND p.status = 'published'`,
          [branchId, productId]
        );

        if (!product) {
          return NextResponse.json(
            { success: false, error: `Product ID #${productId} not found or is unpublished.` },
            { status: 404 }
          );
        }

        const availableStock = Math.max(0, Number(product.branch_stock) - Number(product.reserved_qty));
        const requestedQty = Math.max(1, Number(item.qty || item.quantity || 1));

        if (availableStock < requestedQty) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for "${product.name}". Available at ${branch.name}: ${availableStock}, Requested: ${requestedQty}.`,
            },
            { status: 400 }
          );
        }

        // Check Serial Number if provided
        let serialNumber = item.serialNumber ? String(item.serialNumber).trim() : null;
        let barcode = item.barcode ? String(item.barcode).trim() : product.barcode;

        if (serialNumber) {
          const serialRecord = await queryOne<any>(
            `SELECT * FROM product_serials WHERE product_id = ? AND branch_id = ? AND serial_number = ?`,
            [productId, branchId, serialNumber]
          );

          if (!serialRecord) {
            return NextResponse.json(
              { success: false, error: `Serial number "${serialNumber}" is not registered for "${product.name}" at this branch.` },
              { status: 400 }
            );
          }

          if (serialRecord.status !== 'available') {
            return NextResponse.json(
              { success: false, error: `Serial number "${serialNumber}" is already ${serialRecord.status} and cannot be sold.` },
              { status: 400 }
            );
          }

          barcode = serialRecord.barcode || barcode;
        }

        const unitPrice = Number(product.discount_price || product.selling_price);
        const unitCost = Number(product.purchase_cost || product.avg_cost || 0);

        calculatedSubtotal += unitPrice * requestedQty;
        calculatedCogsTotal += unitCost * requestedQty;

        validatedItems.push({
          isOtherHouse: false,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          barcode,
          serialNumber,
          unitPrice,
          unitCost,
          quantity: requestedQty,
          totalPrice: unitPrice * requestedQty,
          totalCost: unitCost * requestedQty,
          warrantyDetails: product.warranty_period || '1 Year Official Warranty',
          isPcBuilder: Boolean(product.is_pc_builder),
          componentType: product.pc_builder_component,
        });
      }
    }

    // 4. Financial Calculations
    const cleanDiscount = Math.max(0, Number(discountAmount || 0));
    const cleanTax = Math.max(0, Number(taxAmount || 0));
    const finalTotal = Math.max(0, calculatedSubtotal - cleanDiscount + cleanTax);
    const finalGrossProfit = finalTotal - calculatedCogsTotal;

    // 5. Generate Unique POS Order & Invoice Number
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `POS-${branch.code}-${dateStr}-${randomSuffix}`;
    const paymentNumber = `PAY-POS-${dateStr}-${randomSuffix}`;

    // 6. Execute Atomic Database Transaction
    const result = await withTransaction(async (conn) => {
      // Find or create / update persistent customer record with address
      let customerId: number | null = null;
      const cleanPhone = customerPhone ? customerPhone.trim() : '';
      const cleanName = customerName ? customerName.trim() : 'Walk-in Customer';
      const cleanEmail = customerEmail ? customerEmail.trim() : null;
      const cleanAddress = customerAddress ? customerAddress.trim() : null;

      if (cleanPhone && cleanPhone !== '01700000000') {
        const [existingCustomer] = await conn.query<any[]>(
          `SELECT id, address, email FROM customers WHERE phone = ? LIMIT 1`,
          [cleanPhone]
        );
        if (existingCustomer.length > 0) {
          customerId = existingCustomer[0].id;
          // Update customer details with latest address & name if provided
          await conn.query(
            `UPDATE customers 
             SET name = COALESCE(?, name), 
                 email = COALESCE(?, email), 
                 address = COALESCE(?, address),
                 updated_at = NOW() 
             WHERE id = ?`,
            [cleanName, cleanEmail, cleanAddress, customerId]
          );

          if (cleanAddress) {
            // Also ensure address is recorded in customer_addresses
            const [existingAddr] = await conn.query<any[]>(
              `SELECT id FROM customer_addresses WHERE customer_id = ? LIMIT 1`,
              [customerId]
            );
            if (existingAddr.length > 0) {
              await conn.query(
                `UPDATE customer_addresses SET address_line1 = ?, full_name = ?, phone = ? WHERE id = ?`,
                [cleanAddress, cleanName, cleanPhone, existingAddr[0].id]
              );
            } else {
              await conn.query(
                `INSERT INTO customer_addresses (customer_id, title, full_name, phone, address_line1, city, is_default)
                 VALUES (?, 'Counter Sale Address', ?, ?, ?, 'Dhaka', 1)`,
                [customerId, cleanName, cleanPhone, cleanAddress]
              );
            }
          }
        } else {
          // Register new customer in database
          const [newCustRes] = await conn.query<any>(
            `INSERT INTO customers (name, phone, email, address, status, is_verified, reward_points, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'active', 1, 0, NOW(), NOW())`,
            [cleanName, cleanPhone, cleanEmail, cleanAddress]
          );
          customerId = newCustRes.insertId;

          if (cleanAddress && customerId) {
            await conn.query(
              `INSERT INTO customer_addresses (customer_id, title, full_name, phone, address_line1, city, is_default)
               VALUES (?, 'Default POS Address', ?, ?, ?, 'Dhaka', 1)`,
              [customerId, cleanName, cleanPhone, cleanAddress]
            );
          }
        }
      }

      // 6a. Insert Order
      const [orderInsertRes] = await conn.query<any>(
        `INSERT INTO orders (
          order_number, customer_id, branch_id, order_type, order_status,
          payment_status, payment_method, subtotal, discount_amount, tax_amount,
          total_amount, paid_amount, due_amount, cogs_total, gross_profit,
          shipping_address_json, notes, created_by, created_at, updated_at
        ) VALUES (
          ?, ?, ?, 'pos', 'delivered',
          'paid', ?, ?, ?, ?,
          ?, ?, 0, ?, ?,
          ?, ?, ?, NOW(), NOW()
        )`,
        [
          orderNumber,
          customerId,
          branchId,
          paymentMethod,
          calculatedSubtotal,
          cleanDiscount,
          cleanTax,
          finalTotal,
          finalTotal,
          calculatedCogsTotal,
          finalGrossProfit,
          JSON.stringify({
            full_name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: customerAddress || 'Counter Walk-in / Direct POS Sale',
            branch_name: branch.name,
            cashier_name: user.name,
          }),
          notes || 'POS Retail Counter Sale',
          user.id,
        ]
      );

      const orderId = orderInsertRes.insertId;

      // 6b. Insert Payment
      await conn.query(
        `INSERT INTO payments (
          order_id, payment_number, method, amount, status, transaction_ref, created_at
        ) VALUES (
          ?, ?, ?, ?, 'completed', ?, NOW()
        )`,
        [orderId, paymentNumber, paymentMethod, finalTotal, `POS-TX-${dateStr}-${randomSuffix}`]
      );

      // 6c. Insert Line Items & Deduct Inventory / Mark Serials
      const savedItems = [];
      for (const item of validatedItems) {
        const [itemInsertRes] = await conn.query<any>(
          `INSERT INTO order_items (
            order_id, product_id, product_name, sku, unit_price,
            unit_cost, quantity, total_price, total_cost, warranty_details,
            serial_number, barcode
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?
          )`,
          [
            orderId,
            item.productId,
            item.productName,
            item.sku,
            item.unitPrice,
            item.unitCost,
            item.quantity,
            item.totalPrice,
            item.totalCost,
            item.warrantyDetails,
            item.serialNumber || null,
            item.barcode || null,
          ]
        );

        const orderItemId = itemInsertRes.insertId;
        savedItems.push({ ...item, id: orderItemId, orderId });

        if (item.isOtherHouse) {
          // Mark Other House item as sold
          await conn.query(
            `UPDATE other_house_purchases
             SET status = 'sold', paid_at = NOW(), updated_at = NOW()
             WHERE id = ?`,
            [item.ohId]
          );
        } else {
          // Decrement regular inventory stock
          await conn.query(
            `UPDATE inventory
             SET quantity = GREATEST(0, quantity - ?), updated_at = NOW()
             WHERE product_id = ? AND branch_id = ?`,
            [item.quantity, item.productId, branchId]
          );

          // Record inventory audit transaction
          await conn.query(
            `INSERT INTO inventory_transactions (
              product_id, branch_id, transaction_type, quantity, reference_type, reference_id, unit_cost, notes, created_by, created_at
            ) VALUES (
              ?, ?, 'sale', ?, 'pos_order', ?, ?, ?, ?, NOW()
            )`,
            [
              item.productId,
              branchId,
              -item.quantity,
              orderId,
              item.unitCost,
              `POS Sale #${orderNumber} to ${customerName}`,
              user.id,
            ]
          );

          // If serialized, mark serial number as sold
          if (item.serialNumber) {
            await conn.query(
              `UPDATE product_serials
               SET status = 'sold', order_id = ?, order_item_id = ?, sold_at = NOW(), updated_at = NOW()
               WHERE product_id = ? AND branch_id = ? AND serial_number = ?`,
              [orderId, orderItemId, item.productId, branchId, item.serialNumber]
            );
          }
        }
      }

      return {
        orderId,
        orderNumber,
        paymentNumber,
        savedItems,
      };
    });

    // 7. System Audit Log
    await logAudit({
      userId: user.id,
      userName: user.name,
      roleName: user.role_name || 'Staff',
      module: 'pos',
      action: 'create_pos_sale',
      recordId: result.orderId,
      newData: {
        orderNumber: result.orderNumber,
        branchId,
        branchName: branch.name,
        customerName,
        customerPhone,
        totalAmount: finalTotal,
        paymentMethod,
        itemCount: validatedItems.length,
        items: validatedItems.map((i) => ({
          name: i.productName,
          sku: i.sku,
          sn: i.serialNumber,
          qty: i.quantity,
          price: i.unitPrice,
        })),
      },
    });

    // 8. Return Complete Receipt Payload
    return NextResponse.json({
      success: true,
      message: 'POS Counter sale completed successfully.',
      order: {
        id: result.orderId,
        orderNumber: result.orderNumber,
        date: timestamp.toISOString(),
        formattedDate: timestamp.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        branch: {
          id: branch.id,
          name: branch.name,
          code: branch.code,
          address: branch.address,
          phone: branch.phone,
          email: branch.email,
        },
        cashier: {
          id: user.id,
          name: user.name,
          role: user.role_name || 'Store Manager',
        },
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress,
        },
        items: result.savedItems,
        subtotal: calculatedSubtotal,
        discount: cleanDiscount,
        tax: cleanTax,
        grandTotal: finalTotal,
        paymentMethod,
        paymentStatus: 'paid',
        warrantyPolicy: '1-3 Years Official Brand Warranty on Hardware components as indicated on invoice lines.',
        returnPolicy: 'Physical goods once sold can be claimed for warranty or RMA within 7 days with original invoice & serial numbers intact.',
      },
    });
  } catch (error: any) {
    console.error('POS Sale checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process POS sale transaction.',
      },
      { status: 500 }
    );
  }
}
