/**
 * Stadium — domain OUT (GDD §13 / economy).
 * Soft-lock enforced by SoftLockRouteGate (LFE-SOFTLOCK-01 · D52/D65).
 * Honest stub only if route ever opens — no Fake Production.
 */
export default function StadiumPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--lf-color-text-primary)]">
        Stadion
      </h1>
      <p className="mt-2 text-[13px] text-[var(--lf-muted)]">
        Pojemność, frekwencja i bilety pojawią się wraz z mechaniką stadionu. Ta powierzchnia nie
        udaje przychodów ani poziomów rozbudowy.
      </p>
    </div>
  );
}
