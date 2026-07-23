import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Grid, GridItem } from '@/components/layout/Grid';
import {
  PlayerActions,
  PlayerAttributes,
  PlayerContract,
  PlayerHero,
  PlayerHistory,
} from '@/components/squad/PlayerDetail';
import { getPlayerById } from '@/data/squad';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) notFound();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-4)' }}>
      <Breadcrumbs
        items={[
          { label: 'Klub', href: '/club' },
          { label: 'Kadra', href: '/squad' },
          { label: player.name },
        ]}
      />

      <PlayerHero player={player} />
      <PlayerActions player={player} />

      <Grid>
        <GridItem span={7}>
          <PlayerAttributes player={player} />
        </GridItem>
        <GridItem span={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
            <PlayerContract player={player} />
            <PlayerHistory player={player} />
            <Link
              href="/squad"
              style={{
                fontSize: 'var(--lf-type-caption)',
                color: 'var(--lf-color-text-gold)',
              }}
            >
              ← Wróć do kadry
            </Link>
          </div>
        </GridItem>
      </Grid>
    </div>
  );
}
