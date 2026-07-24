/**
 * S0 wow — empty crest awaiting the player's club.
 * Recognition without wordmark: gold shield on void = LastFootball.
 */
export function HeroCrest() {
  return (
    <div className="lf-landing__crest" aria-hidden>
      <svg
        className="lf-landing__crest-svg"
        viewBox="0 0 120 140"
        width="120"
        height="140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="lf-landing__crest-shield"
          d="M60 8 L108 28 V68 C108 100 84 124 60 132 C36 124 12 100 12 68 V28 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className="lf-landing__crest-inner"
          d="M60 22 L94 36 V66 C94 90 76 108 60 114 C44 108 26 90 26 66 V36 Z"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.45"
        />
        <line
          className="lf-landing__crest-dash"
          x1="40"
          y1="70"
          x2="80"
          y2="70"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>
      <span className="lf-landing__crest-caption">Twój herb</span>
    </div>
  );
}
