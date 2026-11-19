import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Power } from 'lucide-react';
import { ANIMAL_KEYS, ANIMALS, AnimalEngine, SHARED_CONTROLS } from '../../vendor/ascii-animals';
import './AsciiAnimals.css';

/**
 * ASCII animals roaming behind the contact section (engine vendored from
 * github.com/DesignerStephen1/ascii-animals, MIT — see src/vendor/ascii-animals/LICENSE).
 *
 * Dock: pick an animal, open Tweaks, switch the layer off. Clicking empty background startles them.
 * Choices and per-animal tweaks persist in localStorage under `sg-ascii:` keys.
 */
const STORE = 'sg-ascii:';
const DEFAULT_ANIMAL = 'koi';
const OPACITY_DEFAULT = 0.65;

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(STORE + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try { localStorage.setItem(STORE + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
};

/** Only the knobs that differ from the animal's defaults. */
function changedFrom(tuning, defaults) {
  const out = {};
  for (const key of Object.keys(defaults)) if (tuning[key] !== defaults[key]) out[key] = tuning[key];
  return out;
}

function savedTuning(key) {
  const defaults = ANIMALS[key].defaults;
  const saved = read(`tweaks:${key}`, {});
  const out = {};
  for (const [k, v] of Object.entries(saved ?? {})) if (k in defaults && typeof v === typeof defaults[k]) out[k] = v;
  return out;
}

/** Shared Movement knobs, the animal's own groups, then shared Look knobs. */
function groupsFor(key) {
  const a = ANIMALS[key];
  const hidden = new Set(a.hide ?? []);
  const keep = specs => specs.filter(s => !hidden.has(s.key));
  return [['Movement', keep(SHARED_CONTROLS.movement)], ...a.controls, ['Look', keep(SHARED_CONTROLS.look)]];
}

const decimals = step => (step >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(step))));
const swatch = key => `rgb(${ANIMALS[key].swatch.join(',')})`;

export default function ContactAnimals({ theme = 'dark' }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [animal, setAnimal] = useState(() => {
    const saved = read('animal', DEFAULT_ANIMAL);
    return typeof saved === 'string' && saved in ANIMALS ? saved : DEFAULT_ANIMAL;
  });
  const [tuning, setTuning] = useState(() => ({ ...ANIMALS[animal].defaults, ...savedTuning(animal) }));
  const [on, setOn] = useState(() => read('on', true) !== false);
  const [opacity, setOpacity] = useState(() => {
    const v = Number(read('opacity', OPACITY_DEFAULT));
    return Number.isFinite(v) ? Math.min(1, Math.max(0.1, v)) : OPACITY_DEFAULT;
  });
  const [open, setOpen] = useState(false);

  // The engine lives as long as the layer is on; animal, knobs and theme changes go through it directly.
  useEffect(() => {
    if (!on || !canvasRef.current) return undefined;
    const engine = new AnimalEngine(canvasRef.current, { animal, theme, tuning });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // Created once per "on"; later changes are pushed through setAnimal / set / setTheme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  useEffect(() => { engineRef.current?.setTheme(theme); }, [theme]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const pickAnimal = key => {
    if (key === animal) return;
    const overrides = savedTuning(key);
    engineRef.current?.setAnimal(key, overrides);
    setAnimal(key);
    setTuning({ ...ANIMALS[key].defaults, ...overrides });
    write('animal', key);
  };

  const setKnob = (key, value) => {
    engineRef.current?.set(key, value);
    const next = { ...tuning, [key]: value };
    setTuning(next);
    write(`tweaks:${animal}`, changedFrom(next, ANIMALS[animal].defaults));
  };

  const resetAll = () => {
    const defaults = ANIMALS[animal].defaults;
    for (const key of Object.keys(changedFrom(tuning, defaults))) engineRef.current?.set(key, defaults[key]);
    setTuning({ ...defaults });
    write(`tweaks:${animal}`, {});
    setOpacity(OPACITY_DEFAULT);
    write('opacity', OPACITY_DEFAULT);
  };

  const toggleOn = () => {
    setOn(v => {
      write('on', !v);
      return !v;
    });
  };

  const changeOpacity = v => {
    setOpacity(v);
    write('opacity', v);
  };

  const defaults = ANIMALS[animal].defaults;

  const renderKnob = spec => {
    const id = `aa-${animal}-${spec.key}`;
    const isDefault = tuning[spec.key] === defaults[spec.key];
    const resetOne = () => setKnob(spec.key, defaults[spec.key]);
    if (spec.toggle) {
      const checked = Boolean(tuning[spec.key]);
      return (
        <div key={spec.key} className="aa-row aa-row--toggle" title={spec.hint}>
          <span className="aa-label" onDoubleClick={resetOne}>{spec.label}{!isDefault && <i className="aa-dirty" aria-hidden="true" />}</span>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={spec.label}
            className={`aa-switch ${checked ? 'is-on' : ''}`}
            onClick={() => setKnob(spec.key, !checked)}
          ><span /></button>
        </div>
      );
    }
    const disabled = spec.disabledWhen ? Boolean(tuning[spec.disabledWhen]) : false;
    const value = Number(tuning[spec.key]);
    return (
      <div key={spec.key} className={`aa-row ${disabled ? 'is-disabled' : ''}`} title={spec.hint}>
        <label htmlFor={id} className="aa-label" onDoubleClick={resetOne}>
          {spec.label}{!isDefault && <i className="aa-dirty" aria-hidden="true" />}
        </label>
        <output htmlFor={id} className="aa-value">{value.toFixed(decimals(spec.step))}</output>
        <input
          id={id}
          type="range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={value}
          disabled={disabled}
          onChange={e => setKnob(spec.key, Number(e.target.value))}
          style={{ '--aa-fill': `${((value - spec.min) / (spec.max - spec.min)) * 100}%` }}
        />
      </div>
    );
  };

  return (
    <>
      <div className="aa-layer" style={{ '--aa-opacity': opacity }} aria-hidden="true">
        {on && <canvas ref={canvasRef} className="aa-canvas" />}
      </div>

      <div className="aa-dock font-mono" role="toolbar" aria-label="Background animals">
        <div className="aa-chips" role="radiogroup" aria-label="Animal">
          {ANIMAL_KEYS.map(key => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={key === animal}
              className={`aa-chip ${key === animal ? 'is-active' : ''}`}
              onClick={() => pickAnimal(key)}
              disabled={!on}
            >
              <span className="aa-swatch" style={{ background: swatch(key) }} />
              {ANIMALS[key].label}
            </button>
          ))}
        </div>
        <span className="aa-sep" aria-hidden="true" />
        <button
          type="button"
          className={`aa-icon-btn ${open ? 'is-active' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="aa-tweaks"
          disabled={!on}
          title="Tweaks"
        >
          <SlidersHorizontal size={14} /><span>Tweaks</span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          className={`aa-icon-btn aa-power ${on ? 'is-on' : ''}`}
          onClick={toggleOn}
          title={on ? 'Hide animals' : 'Show animals'}
          aria-label="Background animals"
        >
          <Power size={14} />
        </button>
      </div>

      {open && on && (
        <aside id="aa-tweaks" className="aa-tweaks font-mono" aria-label="Animal tweaks" data-lenis-prevent>
          <header className="aa-tweaks-head">
            <span className="aa-swatch" style={{ background: swatch(animal) }} />
            <h3>Tweaks · {ANIMALS[animal].label}</h3>
            <button type="button" className="aa-mini" onClick={resetAll} title="Reset this animal"><RotateCcw size={12} /> Reset</button>
            <button type="button" className="aa-mini aa-close" onClick={() => setOpen(false)} aria-label="Close tweaks"><X size={14} /></button>
          </header>
          <div className="aa-tweaks-body">
            <section className="aa-group">
              <h4>Layer</h4>
              <div className="aa-row" title="How strongly the animals show through behind the section.">
                <label htmlFor="aa-opacity" className="aa-label" onDoubleClick={() => changeOpacity(OPACITY_DEFAULT)}>Visibility</label>
                <output htmlFor="aa-opacity" className="aa-value">{opacity.toFixed(2)}</output>
                <input
                  id="aa-opacity"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={e => changeOpacity(Number(e.target.value))}
                  style={{ '--aa-fill': `${((opacity - 0.1) / 0.9) * 100}%` }}
                />
              </div>
            </section>
            {groupsFor(animal).map(([title, specs]) => (
              <section key={title} className="aa-group">
                <h4>{title}</h4>
                {specs.map(renderKnob)}
              </section>
            ))}
            <p className="aa-foot">Double-click a label to reset it · click the background to startle them</p>
          </div>
        </aside>
      )}
    </>
  );
}
