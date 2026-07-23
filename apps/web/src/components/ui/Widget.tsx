import type { ReactNode } from 'react';

import { Panel } from './Panel';

type WidgetProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

/** Compact right-rail information block. */
export function Widget({ title, children, action }: WidgetProps) {
  return (
    <Panel title={title} action={action} className="text-[12px]" bodyClassName="space-y-1.5 p-2">
      {children}
    </Panel>
  );
}
