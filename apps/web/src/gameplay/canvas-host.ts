/**
 * Canvas host contract — GAMEPLAY-01.
 * Canvas is a read-only renderer. It must not import CommandBus or mutate MatchState.
 */

import type { MatchSession, MatchState, MatchSpatialState } from '@lastfootball/lfe';

export const MATCH_CANVAS_ROOT_ID = 'lf-match-canvas-root' as const;

export type MatchCanvasReadModel = {
  readonly matchId: string;
  readonly matchState: MatchState;
  readonly spatial: MatchSpatialState;
  readonly tick: number;
};

export type MatchCanvasHost = {
  readonly elementId: typeof MATCH_CANVAS_ROOT_ID;
  /** Bind a live session — renderer may poll getReadModel(). */
  bind(session: MatchSession): void;
  unbind(): void;
  getReadModel(): MatchCanvasReadModel | null;
  /** Reserved: future attach of Canvas renderer instance. */
  attachRenderer(renderer: MatchCanvasRenderer | null): void;
};

/** Future Canvas engine plugs here — no gameplay dependency. */
export type MatchCanvasRenderer = {
  mount(root: HTMLElement): void;
  unmount(): void;
  /** Push latest read model (called by host; renderer never pulls CommandBus). */
  render(model: MatchCanvasReadModel): void;
};

export function createMatchCanvasHost(): MatchCanvasHost {
  let session: MatchSession | null = null;
  let renderer: MatchCanvasRenderer | null = null;

  const host: MatchCanvasHost = {
    elementId: MATCH_CANVAS_ROOT_ID,
    bind(s) {
      session = s;
    },
    unbind() {
      session = null;
      if (renderer) {
        renderer.unmount();
      }
    },
    getReadModel() {
      if (!session || session.status === 'disposed') return null;
      const matchState = session.getMatchState();
      return {
        matchId: session.id,
        matchState,
        spatial: session.getSpatialState(),
        tick: matchState.tick,
      };
    },
    attachRenderer(next) {
      renderer = next;
      if (!next) return;
      const el =
        typeof document !== 'undefined' ? document.getElementById(MATCH_CANVAS_ROOT_ID) : null;
      if (el) next.mount(el);
      const model = host.getReadModel();
      if (model) next.render(model);
    },
  };

  return host;
}
