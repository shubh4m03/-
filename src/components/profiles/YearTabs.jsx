/** Segmented control for the activity-graph range ('last' = rolling 365 days, or a year). */
export default function YearTabs({ views, value, onChange }) {
  return (
    <div className="pd-years font-mono" role="tablist" aria-label="Activity range">
      {views.map(v => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={v === value}
          className={v === value ? 'is-active' : ''}
          onClick={() => onChange(v)}
        >
          {v === 'last' ? 'Last 12 mo' : v}
        </button>
      ))}
    </div>
  );
}
