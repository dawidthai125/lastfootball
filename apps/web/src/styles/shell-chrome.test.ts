import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Component CSS sets display outside Tailwind layers, so md:hidden never won.
 * The hide has to live in the same stylesheet, at the 768px shell split.
 */
describe('shell chrome display split', () => {
  const root = process.cwd();

  it('hides the phone cash readout from 768px', () => {
    const css = readFileSync(join(root, 'src/app/globals.css'), 'utf8');
    expect(css).toMatch(
      /@media \(min-width: 768px\) \{\s*\.lf-chrome-metric--phone \{\s*display: none;/,
    );
    expect(css).toMatch(
      /@media \(max-width: 767px\) \{\s*\.lf-chrome-metric--desk \{\s*display: none;/,
    );
  });

  it('hides the phone bar from 768px', () => {
    const css = readFileSync(join(root, 'src/components/layout/mobile-nav.css'), 'utf8');
    expect(css).toMatch(/@media \(min-width: 768px\) \{\s*\.lf-mobile-nav \{\s*display: none;/);
  });

  it('hides transfer cards from 768px', () => {
    const css = readFileSync(join(root, 'src/components/transfers/transfers-decision.css'), 'utf8');
    expect(css).toMatch(/@media \(min-width: 768px\) \{\s*\.lf-tx__cards \{\s*display: none;/);
  });
});
