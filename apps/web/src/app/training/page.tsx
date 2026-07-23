import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Select, Field } from '@/components/ui/FormControls';
import { Badge } from '@/components/ui/Badge';
import { dashboardMock } from '@/data/mock';

export default function TrainingPage() {
  const t = dashboardMock.nextTraining;

  return (
    <div>
      <SectionHeader
        title="Trening"
        subtitle="Plan sesji i obciążenie drużyny"
        action={<Badge tone="ok">Sesja dostępna</Badge>}
      />
      <div className="grid gap-2 lg:grid-cols-[1fr_280px]">
        <Panel title="Nadchodząca sesja">
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <Field label="Focus">
              <Select defaultValue="endurance">
                <option value="endurance">Wytrzymałość</option>
                <option value="tactics">Taktyka</option>
                <option value="shooting">Strzały</option>
                <option value="defense">Obrona</option>
              </Select>
            </Field>
            <Field label="Intensywność">
              <Select defaultValue="medium">
                <option value="low">Niska</option>
                <option value="medium">Średnia</option>
                <option value="high">Wysoka</option>
              </Select>
            </Field>
            <Field label="Czas">
              <Select defaultValue="60">
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-between gap-2 border border-[var(--lf-border)] bg-[var(--lf-inset)] px-2 py-2 text-[12px]">
            <div>
              <div className="font-medium text-[var(--lf-text-strong)]">{t.focus}</div>
              <div className="text-[var(--lf-muted)]">
                {t.when} · {t.intensity}
              </div>
            </div>
            <Button variant="primary" size="md">
              Rozpocznij trening
            </Button>
          </div>
        </Panel>
        <Panel title="Obciążenie">
          <ul className="space-y-2 text-[12px]">
            <li className="flex justify-between">
              <span className="text-[var(--lf-muted)]">Średnie zmęczenie</span>
              <span className="tabular-nums">38%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--lf-muted)]">Ryzyko kontuzji</span>
              <span className="tabular-nums text-[var(--lf-warn)]">umiarkowane</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--lf-muted)]">Ostatnia sesja</span>
              <span>wczoraj</span>
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
