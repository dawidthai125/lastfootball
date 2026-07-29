/**
 * Static UI crops for Landing showcase — mirror real Hub / Live / XI chrome
 * with design tokens only (no game logic, no new illustrations).
 */
export function LandingUiCrops() {
  return (
    <div className="lf-landing__showcase-grid" aria-hidden>
      <figure className="lf-landing__crop">
        <figcaption className="lf-landing__crop-caption">Gabinet · sprawa dnia</figcaption>
        <div className="lf-landing__crop-frame lf-landing__crop-frame--decision">
          <p className="lf-landing__crop-eyebrow">Sprawa dnia</p>
          <p className="lf-landing__crop-title">Kolejka 3 · vs FC Rivale</p>
          <p className="lf-landing__crop-meta">Sobota · 18:00 · Dom</p>
          <span className="lf-landing__crop-primary">Wejdź na mecz</span>
        </div>
      </figure>

      <figure className="lf-landing__crop">
        <figcaption className="lf-landing__crop-caption">Live · scorebug</figcaption>
        <div className="lf-landing__crop-frame lf-landing__crop-frame--scorebug">
          <div className="lf-landing__crop-live">
            <span className="lf-landing__crop-live-dot" />
            Live
          </div>
          <div className="lf-landing__crop-scoreline">
            <span>Twój klub</span>
            <strong className="lf-landing__crop-score">1 – 0</strong>
            <span>FC Rivale</span>
          </div>
          <div className="lf-landing__crop-minute">67′</div>
        </div>
      </figure>

      <figure className="lf-landing__crop">
        <figcaption className="lf-landing__crop-caption">XI · skład na mecz</figcaption>
        <div className="lf-landing__crop-frame lf-landing__crop-frame--xi">
          <div className="lf-landing__crop-pitch">
            <span className="lf-landing__crop-slot" style={{ gridArea: 'gk' }}>
              GK
            </span>
            <span className="lf-landing__crop-slot" style={{ gridArea: 'df1' }}>
              DF
            </span>
            <span className="lf-landing__crop-slot" style={{ gridArea: 'df2' }}>
              DF
            </span>
            <span className="lf-landing__crop-slot" style={{ gridArea: 'mf' }}>
              MF
            </span>
            <span className="lf-landing__crop-slot" style={{ gridArea: 'fw' }}>
              FW
            </span>
          </div>
          <p className="lf-landing__crop-xi-label">4-3-3 · gotowy do kick-off</p>
        </div>
      </figure>
    </div>
  );
}

/** Compact scorebug used inside Match Experience band. */
export function LandingScorebugCrop() {
  return (
    <div className="lf-landing__scorebug" aria-hidden>
      <span className="lf-landing__scorebug-chip">
        <span className="lf-landing__scorebug-dot" />
        Live
      </span>
      <div className="lf-landing__scorebug-line">
        <span>Twój klub</span>
        <strong>2 – 1</strong>
        <span>FC Rivale</span>
      </div>
      <span className="lf-landing__scorebug-min">78′</span>
    </div>
  );
}
