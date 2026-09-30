export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role_id: number;
  role_name?: string;
  role_slug?: string;
  branch_id?: number | null;
  branch_name?: string;
  branch_code?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  type: 'shop' | 'warehouse' | 'rma_center';
  address: string;
  phone: string;
  email?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  parent_id?: number | null;
  parent_name?: string;
  name: string;
  slug: string;
  h1?: string;
  image?: string;
  banner?: string;
  short_desc?: string;
  long_desc?: string;
  order_index: number;
  is_active: boolean;
  meta_title?: string;
  meta_desc?: string;
  focus_keyword?: string;
  secondary_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_desc?: string;
  og_image?: string;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  short_desc?: string;
  country?: string;
  website?: string;
  is_featured: boolean;
  is_active: boolean;
  meta_title?: string;
  meta_desc?: string;
  og_title?: string;
  og_desc?: string;
  og_image?: string;
}

export interface ProductSpecification {
  id?: number;
  attribute_id: number;
  attribute_name?: string;
  attribute_code?: string;
  attribute_value: string;
  custom_label?: string;
}

export interface ProductInventory {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  quantity: number;
  reserved_qty: number;
  rma_qty: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  model?: string;
  mpn?: string;
  brand_id: number;
  brand_name?: string;
  brand_slug?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  warranty_period: string;
  status: 'published' | 'draft' | 'archived';
  is_featured: boolean;
  is_new: boolean;
  is_hot: boolean;
  is_sale: boolean;
  is_pc_builder: boolean;
  pc_builder_component?: string;
  purchase_cost: number;
  avg_cost: number;
  selling_price: number;
  discount_price?: number;
  min_selling_price: number;
  discount_amount: number;
  discount_percent: number;
  rating_avg: number;
  rating_count: number;
  seo_score: number;
  primary_image?: string;
  images?: Array<{ id: number; image_url: string; alt_text?: string; is_primary: boolean }>;
  specifications?: ProductSpecification[];
  overview?: string;
  key_features?: string[];
  what_in_box?: string;
  inventory?: ProductInventory[];
  total_stock?: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  unit_cost: number;
  quantity: number;
  total_price: number;
  total_cost: number;
  warranty_details?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  branch_id: number;
  branch_name?: string;
  order_type: 'online' | 'pos';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded';
  payment_method: 'cod' | 'bkash' | 'nagad' | 'sslcommerz' | 'card' | 'cash_pos' | 'emi';
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  cogs_total: number;
  gross_profit: number;
  shipping_address_json?: any;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface RmaCase {
  id: number;
  rma_number: string;
  customer_id?: number;
  customer_name: string;
  customer_phone: string;
  product_id: number;
  product_name?: string;
  serial_number: string;
  problem_description: string;
  warranty_status: 'in_warranty' | 'out_of_warranty' | 'void';
  status: 'received' | 'inspection' | 'diagnosis' | 'repair' | 'vendor' | 'waiting_vendor' | 'replacement' | 'refund' | 'ready_for_customer' | 'delivered' | 'closed';
  technician_id?: number;
  technician_name?: string;
  vendor_id?: number;
  vendor_name?: string;
  parts_cost: number;
  labor_cost: number;
  transport_cost: number;
  vendor_cost: number;
  other_cost: number;
  refund_cost: number;
  replacement_cost: number;
  total_rma_cost: number;
  resolution_notes?: string;
  created_at: string;
}

export interface SeoLandingPage {
  id: number;
  slug: string;
  h1: string;
  intro_text?: string;
  category_id?: number;
  brand_id?: number;
  meta_title: string;
  meta_desc: string;
  focus_keyword?: string;
  canonical_url?: string;
  og_title?: string;
  og_desc?: string;
  og_image?: string;
  is_published: boolean;
}
