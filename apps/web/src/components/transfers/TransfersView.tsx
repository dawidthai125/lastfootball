'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Table } from '@/components/ui/Table';
import { formatMoney } from '@/lib/finance/format-money';
import {
  buyTransferPlayer,
  respondIncomingOffer,
  sellTransferPlayer,
  setTransferListing,
} from '@/lib/transfers/actions';
import { TRANSFER_ACTION_INITIAL } from '@/lib/transfers/action-types';
import {
  resolveCounterAmount,
  resolveOfferAmount,
  type OfferPreset,
} from '@/lib/transfers/resolve-negotiation';
import type { IncomingOfferDto, SellCandidateDto, TransferMarketDto } from '@/lib/transfers/types';

const PRESET_LABEL: Record<OfferPreset, string> = {
  low: 'Niska',
  normal: 'Normalna',
  high: 'Wysoka',
};

function BuyNegotiate({
  marketId,
  ask,
  canBuy,
  envelopeBalance,
}: {
  marketId: string;
  ask: number;
  canBuy: boolean;
  envelopeBalance: number;
}) {
  const [state, action, pending] = useActionState(buyTransferPlayer, TRANSFER_ACTION_INITIAL);
  const counter = state.negotiation?.marketId === marketId ? state.negotiation : null;

  if (counter) {
    const canAccept = canBuy && envelopeBalance >= counter.counterAmount;
    return (
      <div className="flex flex-col items-end gap-1">
        <p className="m-0 max-w-[14rem] text-right text-xs text-[var(--lf-color-text-muted)]">
          Kontroferta:{' '}
          <span className="text-[var(--lf-gold)] tabular-nums">
            {formatMoney(counter.counterAmount)}
          </span>
        </p>
        {state.error ? (
          <span className="text-xs text-[var(--lf-danger)]" role="alert">
            {state.error}
          </span>
        ) : null}
        <div className="flex flex-wrap justify-end gap-1">
          <form action={action} className="inline">
            <input type="hidden" name="marketId" value={marketId} />
            <input type="hidden" name="phase" value="counter" />
            <input type="hidden" name="playerAction" value="accept" />
            <Button type="submit" variant="primary" disabled={!canAccept || pending}>
              {pending ? '…' : 'Akceptuj'}
            </Button>
          </form>
          <form action={action} className="inline">
            <input type="hidden" name="marketId" value={marketId} />
            <input type="hidden" name="phase" value="counter" />
            <input type="hidden" name="playerAction" value="reject" />
            <Button type="submit" variant="default" disabled={pending}>
              Odrzuć
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const presets: OfferPreset[] = ['low', 'normal', 'high'];

  return (
    <div className="flex flex-col items-end gap-1">
      {state.error ? (
        <span className="text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <div className="flex flex-wrap justify-end gap-1">
        {presets.map((preset) => {
          const offer =
            preset === 'low' ? resolveCounterAmount(ask) : resolveOfferAmount(ask, preset);
          const disabled = !canBuy || envelopeBalance < offer || pending;
          return (
            <form key={preset} action={action} className="inline">
              <input type="hidden" name="marketId" value={marketId} />
              <input type="hidden" name="phase" value="opening" />
              <input type="hidden" name="preset" value={preset} />
              <Button
                type="submit"
                variant={preset === 'normal' ? 'primary' : 'default'}
                disabled={disabled}
                title={formatMoney(resolveOfferAmount(ask, preset))}
              >
                {PRESET_LABEL[preset]}
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

function SellButton({ playerId, disabled }: { playerId: string; disabled: boolean }) {
  const [state, action, pending] = useActionState(sellTransferPlayer, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="playerId" value={playerId} />
      {state.error ? (
        <span className="mr-1 text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="default" disabled={disabled || pending}>
        {pending ? '…' : 'Sprzedaj'}
      </Button>
    </form>
  );
}

function ListingButton({
  playerId,
  listed,
  disabled,
}: {
  playerId: string;
  listed: boolean;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(setTransferListing, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="intent" value={listed ? 'unlist' : 'list'} />
      {state.error ? (
        <span className="mr-1 text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="default" disabled={Boolean(disabled) || pending}>
        {pending ? '…' : listed ? 'Z listy' : 'Wystaw'}
      </Button>
    </form>
  );
}

function SellActions({ row, canSell }: { row: SellCandidateDto; canSell: boolean }) {
  return (
    <div className="flex flex-wrap justify-end gap-1">
      <ListingButton
        playerId={row.playerId}
        listed={row.listed}
        disabled={!canSell && !row.listed}
      />
      <SellButton playerId={row.playerId} disabled={!canSell} />
    </div>
  );
}

function IncomingOfferActions({ offer, disabled }: { offer: IncomingOfferDto; disabled: boolean }) {
  const [state, action, pending] = useActionState(respondIncomingOffer, TRANSFER_ACTION_INITIAL);
  return (
    <div className="flex flex-col items-end gap-1">
      {state.error ? (
        <span className="text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <div className="flex flex-wrap justify-end gap-1">
        <form action={action} className="inline">
          <input type="hidden" name="offerId" value={offer.offerId} />
          <input type="hidden" name="playerId" value={offer.playerId} />
          <input type="hidden" name="decision" value="accept" />
          <Button type="submit" variant="primary" disabled={disabled || pending}>
            {pending ? '…' : 'Akceptuj'}
          </Button>
        </form>
        <form action={action} className="inline">
          <input type="hidden" name="offerId" value={offer.offerId} />
          <input type="hidden" name="playerId" value={offer.playerId} />
          <input type="hidden" name="decision" value="reject" />
          <Button type="submit" variant="default" disabled={pending}>
            Odrzuć
          </Button>
        </form>
      </div>
    </div>
  );
}

export function TransfersView({ market }: { market: TransferMarketDto }) {
  return (
    <div className="space-y-2">
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
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
        <Panel title="Budżet transferowy">
          <p className="m-0 font-medium text-[var(--lf-gold)] tabular-nums">
            {market.envelopeLabel}
          </p>
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
            przeglądać rynek, ale finalizacja jest zablokowana. Lista wystawionych nie jest
            czyszczona przy zamknięciu okna.
          </p>
        </Panel>
      ) : (
        <Panel title="Negocjacje, lista i oferty AI">
          <p className="m-0 text-sm text-[var(--lf-color-text-muted)]">
            Wystaw zawodnika na listę (ask = fee). Oferty AI tylko dla wystawionych. Instant Sell i
            buy nego bez zmian.
          </p>
        </Panel>
      )}

      <Panel title="Oferty AI (przychodzące)" flush>
        {market.incomingOffers.length === 0 ? (
          <p className="m-0 p-2 text-[var(--lf-color-text-muted)]">
            Brak ofert AI (brak wystawionych, okno zamknięte lub limit kadry).
          </p>
        ) : (
          <Table
            rowKey={(r) => r.offerId}
            rows={[...market.incomingOffers]}
            columns={[
              { key: 'name', header: 'Zawodnik', render: (r) => r.playerName },
              { key: 'pos', header: 'Poz.', render: (r) => r.pos },
              {
                key: 'buyer',
                header: 'Klub AI',
                render: (r) => r.buyerLabel,
              },
              {
                key: 'amount',
                header: 'Oferta',
                align: 'right',
                render: (r) => (
                  <span className="text-[var(--lf-gold)] tabular-nums">{r.amountLabel}</span>
                ),
              },
              {
                key: 'act',
                header: '',
                align: 'right',
                render: (r) => (
                  <IncomingOfferActions
                    offer={r}
                    disabled={!market.windowOpen || !market.canSell}
                  />
                ),
              },
            ]}
          />
        )}
      </Panel>

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
              header: 'Ask',
              align: 'right',
              render: (r) => (
                <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
              ),
            },
            {
              key: 'act',
              header: 'Oferta',
              align: 'right',
              render: (r) => (
                <BuyNegotiate
                  marketId={r.marketId}
                  ask={r.fee}
                  canBuy={market.canBuy}
                  envelopeBalance={market.envelopeBalance}
                />
              ),
            },
          ]}
        />
      </Panel>

      {!market.windowOpen && market.listedPlayers.length > 0 ? (
        <Panel title="Na liście transferowej" flush>
          <Table
            rowKey={(r) => r.playerId}
            rows={[...market.listedPlayers]}
            columns={[
              { key: 'name', header: 'Zawodnik', render: (r) => r.name },
              { key: 'pos', header: 'Poz.', render: (r) => r.pos },
              {
                key: 'fee',
                header: 'Ask',
                align: 'right',
                render: (r) => (
                  <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
                ),
              },
              {
                key: 'act',
                header: '',
                align: 'right',
                render: (r) => <ListingButton playerId={r.playerId} listed disabled={false} />,
              },
            ]}
          />
        </Panel>
      ) : null}

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
              {
                key: 'name',
                header: 'Zawodnik',
                render: (r) => (
                  <span>
                    {r.name}
                    {r.listed ? (
                      <span className="ml-1 text-xs text-[var(--lf-gold)]">· lista</span>
                    ) : null}
                  </span>
                ),
              },
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
                render: (r) => <SellActions row={r} canSell={market.canSell} />,
              },
            ]}
          />
        )}
      </Panel>
    </div>
  );
}
