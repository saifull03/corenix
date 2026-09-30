import { redirect } from 'next/navigation';

export default function OtherHousePage() {
  redirect('/admin/purchases?tab=other-house');
}
