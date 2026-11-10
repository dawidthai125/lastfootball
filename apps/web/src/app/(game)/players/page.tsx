import { permanentRedirect } from 'next/navigation';

/** List lives on the squad screen. Bare /players was a 404. */
export default function PlayersIndexPage() {
  permanentRedirect('/squad');
}
