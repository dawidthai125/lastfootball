import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { sessionChrome } from '@/data/mock';

export default function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profil"
      subtitle={`${sessionChrome.player.name} · konto gracza`}
    />
  );
}
