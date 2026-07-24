import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Select } from '@/components/ui/FormControls';
import { Panel } from '@/components/ui/Panel';

export default function SettingsPage() {
  return (
    <PlaceholderPage title="Ustawienia" subtitle="Konto, powiadomienia i preferencje UI">
      <div className="grid max-w-xl gap-2">
        <Panel title="Preferencje">
          <div className="space-y-2">
            <Field label="Język">
              <Select defaultValue="pl">
                <option value="pl">Polski</option>
                <option value="en">English</option>
              </Select>
            </Field>
            <Field label="Strefa czasowa">
              <Select defaultValue="warsaw">
                <option value="warsaw">Europe/Warsaw</option>
                <option value="utc">UTC</option>
              </Select>
            </Field>
            <Checkbox label="Powiadomienia o meczach" defaultChecked />
            <Checkbox label="Powiadomienia transferowe" defaultChecked />
            <Checkbox label="Skróty klawiszowe" />
            <Button variant="primary">Zapisz</Button>
          </div>
        </Panel>
      </div>
    </PlaceholderPage>
  );
}
