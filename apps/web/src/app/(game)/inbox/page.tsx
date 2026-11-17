import { redirect } from 'next/navigation';

/** Alias for older links — inbox is /messages. */
export default function InboxAliasPage() {
  redirect('/messages');
}
