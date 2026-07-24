'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';

import { ClubCrest } from '@/components/assets/ClubCrest';
import { Field, Input } from '@/components/ui/FormControls';
import { CREATE_CLUB_INITIAL } from '@/lib/club/action-types';
import { createClub } from '@/lib/club/actions';
import type { CrestKey } from '@/assets';
import {
  COLOR_PRESETS,
  CREST_TEMPLATES,
  normalizeClubName,
  normalizeShortName,
  suggestShortName,
  STARTER_PACKAGE,
  CLUB_WIZARD_DRAFT_KEY,
  type ClubWizardDraft,
} from '@/lib/club';

import '@/components/onboarding/club-wizard.css';

const STEPS = [
  { id: 1, label: 'Nazwa' },
  { id: 2, label: 'Barwy' },
  { id: 3, label: 'Herb' },
  { id: 4, label: 'Reveal' },
] as const;

function loadDraft(): ClubWizardDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CLUB_WIZARD_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClubWizardDraft;
  } catch {
    return null;
  }
}

function saveDraft(draft: ClubWizardDraft) {
  try {
    window.sessionStorage.setItem(CLUB_WIZARD_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota */
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(CLUB_WIZARD_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function ClubWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [shortTouched, setShortTouched] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(COLOR_PRESETS[0]!.primary);
  const [secondaryColor, setSecondaryColor] = useState(COLOR_PRESETS[0]!.secondary);
  const [crestTemplateId, setCrestTemplateId] = useState<CrestKey>(CREST_TEMPLATES[0]!.id);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [state, action, pending] = useActionState(createClub, CREATE_CLUB_INITIAL);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setStep(draft.step);
      setName(draft.name);
      setShortName(draft.shortName);
      setShortTouched(Boolean(draft.shortName));
      setPrimaryColor(draft.primaryColor || COLOR_PRESETS[0]!.primary);
      setSecondaryColor(draft.secondaryColor || COLOR_PRESETS[0]!.secondary);
      setCrestTemplateId((draft.crestTemplateId as CrestKey) || CREST_TEMPLATES[0]!.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft({
      step,
      name,
      shortName,
      primaryColor,
      secondaryColor,
      crestTemplateId,
    });
  }, [hydrated, step, name, shortName, primaryColor, secondaryColor, crestTemplateId]);

  const previewShort = useMemo(() => {
    if (shortTouched && shortName) return normalizeShortName(shortName);
    return suggestShortName(name) || 'XXX';
  }, [name, shortName, shortTouched]);

  function goNext() {
    setLocalError(null);
    if (step === 1) {
      const n = normalizeClubName(name);
      const s = shortTouched ? normalizeShortName(shortName) : suggestShortName(n);
      if (n.length < 3 || n.length > 24) {
        setLocalError('Nazwa klubu: 3–24 znaki.');
        return;
      }
      if (!/^[A-Z0-9]{3,4}$/.test(s)) {
        setLocalError('Skrót: 3–4 znaki A–Z / 0–9.');
        return;
      }
      setName(n);
      setShortName(s);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (primaryColor.toLowerCase() === secondaryColor.toLowerCase()) {
        setLocalError('Kolory muszą się różnić.');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!CREST_TEMPLATES.some((t) => t.id === crestTemplateId)) {
        setLocalError('Wybierz herb.');
        return;
      }
      setStep(4);
    }
  }

  function goBack() {
    setLocalError(null);
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  }

  return (
    <div className="lf-wizard">
      <header className="lf-wizard__head">
        <p className="lf-landing__eyebrow">Kreacja klubu</p>
        <h1 className="lf-wizard__title">Twój klub</h1>
        <ol className="lf-wizard__steps" aria-label="Postęp kreacji">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={[
                'lf-wizard__step',
                s.id === step ? 'lf-wizard__step--active' : '',
                s.id < step ? 'lf-wizard__step--done' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="lf-wizard__step-num">{s.id}</span>
              <span className="lf-wizard__step-label">{s.label}</span>
            </li>
          ))}
        </ol>
      </header>

      <div className="lf-wizard__body">
        <aside className="lf-wizard__preview" aria-hidden={step === 4 ? undefined : true}>
          <div
            className="lf-wizard__preview-card"
            style={{
              borderColor: primaryColor,
              background: `linear-gradient(160deg, ${primaryColor}33, var(--lf-color-bg-raised) 55%)`,
            }}
          >
            <ClubCrest
              clubName={name || 'Twój klub'}
              shortName={previewShort}
              crestTemplateId={crestTemplateId}
              size="xl"
              accentColor={secondaryColor}
            />
            <p className="lf-wizard__preview-name">{name || 'Nazwa klubu'}</p>
            <p className="lf-wizard__preview-short">{previewShort}</p>
            <div className="lf-wizard__swatches">
              <span style={{ background: primaryColor }} />
              <span style={{ background: secondaryColor }} />
            </div>
          </div>
        </aside>

        <div className="lf-wizard__panel">
          {(localError || state.error) && (
            <p className="lf-auth-form__error" role="alert">
              {localError ?? state.error}
            </p>
          )}

          {step === 1 && (
            <section className="lf-wizard__section" aria-labelledby="wiz-name">
              <h2 id="wiz-name">Nazwa i skrót</h2>
              <p className="lf-wizard__hint">Tożsamość, którą zobaczysz na Hubie i w lidze.</p>
              <Field label="Nazwa klubu" htmlFor="club-name">
                <Input
                  id="club-name"
                  value={name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setName(v);
                    if (!shortTouched) setShortName(suggestShortName(v));
                  }}
                  maxLength={24}
                  placeholder="Bóbrka United"
                  autoComplete="off"
                />
              </Field>
              <Field label="Skrót (3–4)" htmlFor="club-short" hint="Wielkie litery — edytowalny">
                <Input
                  id="club-short"
                  value={shortName}
                  onChange={(e) => {
                    setShortTouched(true);
                    setShortName(normalizeShortName(e.target.value));
                  }}
                  maxLength={4}
                  placeholder="BU"
                  autoComplete="off"
                />
              </Field>
            </section>
          )}

          {step === 2 && (
            <section className="lf-wizard__section" aria-labelledby="wiz-colors">
              <h2 id="wiz-colors">Barwy klubu</h2>
              <p className="lf-wizard__hint">Główny i dodatkowy — para, która zostanie z Tobą.</p>
              <div className="lf-wizard__presets" role="list">
                {COLOR_PRESETS.map((preset) => {
                  const active =
                    preset.primary === primaryColor && preset.secondary === secondaryColor;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={['lf-wizard__preset', active ? 'lf-wizard__preset--active' : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setSecondaryColor(preset.secondary);
                      }}
                      aria-pressed={active}
                    >
                      <span
                        className="lf-wizard__preset-swatch"
                        style={{ background: preset.primary }}
                      />
                      <span
                        className="lf-wizard__preset-swatch"
                        style={{ background: preset.secondary }}
                      />
                      <span className="lf-wizard__preset-label">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="lf-wizard__section" aria-labelledby="wiz-crest">
              <h2 id="wiz-crest">Herb</h2>
              <p className="lf-wizard__hint">Wybierz szablon — symbol Twojego klubu.</p>
              <div className="lf-wizard__crests" role="listbox" aria-label="Szablony herbów">
                {CREST_TEMPLATES.map((tpl) => {
                  const active = tpl.id === crestTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={['lf-wizard__crest', active ? 'lf-wizard__crest--active' : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setCrestTemplateId(tpl.id)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tpl.src} alt="" width={48} height={48} draggable={false} />
                      <span>{tpl.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="lf-wizard__section lf-wizard__reveal" aria-labelledby="wiz-reveal">
              <h2 id="wiz-reveal">Twój klub jest gotowy</h2>
              <p className="lf-wizard__hint">Pakiet startowy — prezentacja, nie formularz.</p>

              <div className="lf-wizard__reveal-hero">
                <ClubCrest
                  clubName={name}
                  shortName={shortName}
                  crestTemplateId={crestTemplateId}
                  size="xl"
                  accentColor={primaryColor}
                />
                <div>
                  <p className="lf-wizard__reveal-name">{name}</p>
                  <p className="lf-wizard__reveal-meta">
                    {shortName} · {STARTER_PACKAGE.league}
                  </p>
                </div>
              </div>

              <ul className="lf-wizard__package">
                <li>
                  <strong>Stadion</strong>
                  <span>
                    {STARTER_PACKAGE.stadiumLabel(name)} · {STARTER_PACKAGE.stadiumCapacity}
                  </span>
                </li>
                <li>
                  <strong>Skład</strong>
                  <span>{STARTER_PACKAGE.squad}</span>
                </li>
                <li>
                  <strong>Sztab</strong>
                  <span>{STARTER_PACKAGE.coach}</span>
                </li>
                <li>
                  <strong>Liga</strong>
                  <span>{STARTER_PACKAGE.league} — przypisanie startowe</span>
                </li>
              </ul>

              <form
                action={action}
                className="lf-wizard__confirm"
                onSubmit={() => {
                  clearDraft();
                }}
              >
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="shortName" value={shortName} />
                <input type="hidden" name="primaryColor" value={primaryColor} />
                <input type="hidden" name="secondaryColor" value={secondaryColor} />
                <input type="hidden" name="crestTemplateId" value={crestTemplateId} />
                <button
                  type="submit"
                  className="lf-landing__cta lf-landing__cta--primary lf-wizard__cta"
                  disabled={pending}
                >
                  {pending ? 'Zapisuję klub…' : 'Potwierdź i wejdź do Hubu'}
                </button>
              </form>
            </section>
          )}

          {step < 4 && (
            <div className="lf-wizard__nav">
              {step > 1 ? (
                <button
                  type="button"
                  className="lf-landing__cta lf-landing__cta--secondary"
                  onClick={goBack}
                >
                  Wstecz
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="lf-landing__cta lf-landing__cta--primary"
                onClick={goNext}
              >
                Dalej
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
