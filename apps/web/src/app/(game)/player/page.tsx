import { permanentRedirect } from 'next/navigation';

/** Legacy route — permanent redirect to canonical player dossier. */
export default function PlayerPage() {
  permanentRedirect('/players/p-dk');
}
