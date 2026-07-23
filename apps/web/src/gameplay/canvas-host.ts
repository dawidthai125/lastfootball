/**
 * Canvas host contract — GAMEPLAY-01 + CANVAS-RENDERER-01.
 * Canvas is a read-only renderer. It must not import CommandBus or mutate MatchState.
 */

import type { EngineEvent, MatchSession, MatchState, MatchSpatialState } from '@lastfootball/lfe';

export const MATCH_CANVAS_ROOT_ID = 'lf-match-canvas-root' as const;

export type MatchCanvasReadModel = {
  readonly matchId: string;
  readonly matchState: MatchState;
  readonly spatial: MatchSpatialState;
  readonly tick: number;
  /** EventBus history snapshot — read-only for FX / presentation. */
  readonly events: readonly EngineEvent[];
};

export type MatchCanvasHost = {
  readonly elementId: typeof MATCH_CANVAS_ROOT_ID;
  /** Bind a live session — renderer may poll getReadModel(). */
  bind(session: MatchSession): void;
  unbind(): void;
  getReadModel(): MatchCanvasReadModel | null;
  /** Attach Canvas renderer instance (mounts into #lf-match-canvas-root when present). */
  attachRenderer(renderer: MatchCanvasRenderer | null): void;
  /** Push latest live session read model into the attached renderer. */
  pushFrame(): void;
  /** Present an arbitrary read model (LIVE pulse or REPLAY frame). */
  present(model: MatchCanvasReadModel): void;
  getRenderer(): MatchCanvasRenderer | null;
};

/** Canvas engine plugs here — no gameplay / Engine / AI dependency inside renderer. */
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
        renderer = null;
      }
    },
    getReadModel() {
      if (!session || session.status === 'disposed') return null;
      const matchState = session.getMatchState();
      const ctx = session.context();
      return {
        matchId: session.id,
        matchState,
        spatial: session.getSpatialState(),
        tick: matchState.tick,
        events: [...ctx.events.history()],
      };
    },
    attachRenderer(next) {
      if (renderer && renderer !== next) {
        renderer.unmount();
      }
      renderer = next;
      if (!next) return;
      const el =
        typeof document !== 'undefined' ? document.getElementById(MATCH_CANVAS_ROOT_ID) : null;
      if (el) next.mount(el);
      const model = host.getReadModel();
      if (model) next.render(model);
    },
    pushFrame() {
      const model = host.getReadModel();
      if (model) host.present(model);
    },
    present(model) {
      if (!renderer) return;
      renderer.render(model);
    },
    getRenderer() {
      return renderer;
    },
  };

  return host;
}
