'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Table } from '@/components/ui/Table';
import {
  buyTransferPlayer,
  sellTransferPlayer,
} from '@/lib/transfers/actions';
import { TRANSFER_ACTION_INITIAL } from '@/lib/transfers/action-types';
import type { TransferMarketDto } from '@/lib/transfers/types';

function BuyButton({ marketId, disabled }: { marketId: string; disabled: boolean }) {
  const [state, action, pending] = useActionState(buyTransferPlayer, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="marketId" value={marketId} />
      {state.error ? (
        <span className="mr-1 text-[var(--lf-danger)] text-xs" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="primary" disabled={disabled || pending}>
        {pending ? '…' : 'Kup'}
      </Button>
    </form>
  );
}

function SellButton({ playerId, disabled }: { playerId: string; disabled: boolean }) {
  const [state, action, pending] = useActionState(sellTransferPlayer, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="playerId" value={playerId} />
      {state.error ? (
        <span className="mr-1 text-[var(--lf-danger)] text-xs" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="default" disabled={disabled || pending}>
        {pending ? '…' : 'Sprzedaj'}
      </Button>
    </form>
  );
}

export function TransfersView({ market }: { market: TransferMarketDto }) {
  return (
    <div className="space-y-2">
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Panel title="Okno">
          <p className="m-0 text-sm">
            {market.windowOpen ? (
              <span className="text-[var(--lf-ok)]">Otwarte</span>
            ) : (
              <span className="text-[var(--lf-faint)]">Zamknięte</span>
            )}
          </p>
        </Panel>
        <Panel title="Kasa">
          <p className="m-0 font-medium tabular-nums">{market.cashLabel}</p>
        </Panel>
        <Panel title="Kadra">
          <p className="m-0 tabular-nums">
            {market.activeRosterCount} / {market.maxRoster}
          </p>
        </Panel>
        <Panel title="Limit min.">
          <p className="m-0 tabular-nums">{market.minRoster}</p>
        </Panel>
      </div>

      {!market.windowOpen ? (
        <Panel title="Informacja">
          <p className="m-0 text-[var(--lf-color-text-muted)]">
            Okno transferowe otworzy się po rozegraniu {2} kolejek ligowych (Thin). Możesz
            przeglądać rynek, ale finalizacja jest zablokowana.
          </p>
        </Panel>
      ) : null}

      <Panel title="Rynek" flush>
        <Table
          rowKey={(r) => r.marketId}
          rows={[...market.listings]}
          columns={[
            { key: 'name', header: 'Zawodnik', render: (r) => r.name },
            { key: 'pos', header: 'Poz.', render: (r) => r.pos },
            {
              key: 'age',
              header: 'Wiek',
              align: 'right',
              render: (r) => <span className="tabular-nums">{r.age}</span>,
            },
            { key: 'club', header: 'Klub', render: (r) => r.clubLabel },
            {
              key: 'fee',
              header: 'Cena',
              align: 'right',
              render: (r) => (
                <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
              ),
            },
            {
              key: 'act',
              header: '',
              align: 'right',
              render: (r) => (
                <BuyButton
                  marketId={r.marketId}
                  disabled={!market.canBuy || market.cashBalance < r.fee}
                />
              ),
            },
          ]}
        />
      </Panel>

      <Panel title="Twoja kadra — sprzedaż" flush>
        {market.sellCandidates.length === 0 ? (
          <p className="m-0 p-2 text-[var(--lf-color-text-muted)]">
            Brak kandydatów do sprzedaży (limit kadry lub okno zamknięte).
          </p>
        ) : (
          <Table
            rowKey={(r) => r.playerId}
            rows={[...market.sellCandidates]}
            columns={[
              { key: 'name', header: 'Zawodnik', render: (r) => r.name },
              { key: 'pos', header: 'Poz.', render: (r) => r.pos },
              {
                key: 'age',
                header: 'Wiek',
                align: 'right',
                render: (r) => <span className="tabular-nums">{r.age}</span>,
              },
              {
                key: 'fee',
                header: 'Wartość',
                align: 'right',
                render: (r) => (
                  <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
                ),
              },
              {
                key: 'act',
                header: '',
                align: 'right',
                render: (r) => (
                  <SellButton playerId={r.playerId} disabled={!market.canSell} />
                ),
              },
            ]}
          />
        )}
      </Panel>
    </div>
  );
}
