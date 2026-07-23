import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/FormControls';
import { Panel } from '@/components/ui/Panel';
import { Table } from '@/components/ui/Table';

const offers = [
  { id: '1', player: 'K. Baran', pos: 'OB', age: 21, fee: '180 000 €', club: 'Wisła Północ' },
  { id: '2', player: 'A. Wróbel', pos: 'PO', age: 27, fee: '320 000 €', club: 'Atletyk Centrum' },
  { id: '3', player: 'T. Marek', pos: 'N', age: 19, fee: '95 000 €', club: 'Orzeł Grodzisk' },
];

export default function TransfersPage() {
  return (
    <PlaceholderPage title="Transfery" subtitle="Okno transferowe · lista obserwowanych">
      <div className="mb-2 grid gap-2 lg:grid-cols-[240px_1fr]">
        <Panel title="Filtry">
          <div className="space-y-2">
            <Field label="Pozycja">
              <Select defaultValue="all">
                <option value="all">Wszystkie</option>
                <option value="gk">Bramkarz</option>
                <option value="def">Obrońca</option>
                <option value="mid">Pomocnik</option>
                <option value="fwd">Napastnik</option>
              </Select>
            </Field>
            <Field label="Max. cena">
              <Input type="number" placeholder="500000" />
            </Field>
            <Button variant="primary" className="w-full">
              Szukaj
            </Button>
          </div>
        </Panel>
        <Panel title="Oferty rynkowe" flush>
          <Table
            rowKey={(r) => r.id}
            rows={offers}
            columns={[
              { key: 'player', header: 'Zawodnik', render: (r) => r.player },
              { key: 'pos', header: 'Poz.', render: (r) => r.pos },
              {
                key: 'age',
                header: 'Wiek',
                align: 'right',
                render: (r) => <span className="tabular-nums">{r.age}</span>,
              },
              { key: 'club', header: 'Klub', render: (r) => r.club },
              {
                key: 'fee',
                header: 'Cena',
                align: 'right',
                render: (r) => <span className="tabular-nums text-[var(--lf-gold)]">{r.fee}</span>,
              },
            ]}
          />
        </Panel>
      </div>
    </PlaceholderPage>
  );
}
