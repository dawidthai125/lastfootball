import { permanentRedirect } from 'next/navigation';

/** Legacy route. The static demo id is not a club player, so the squad list is the list. */
export default function PlayerPage() {
  permanentRedirect('/squad');
}
