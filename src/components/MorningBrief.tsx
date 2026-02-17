export default function MorningBrief() {
  const now = new Date();
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-semibold text-lg">Morning Brief</h2>
        <span className="text-xs text-whale-muted">{dayStr}</span>
      </div>
      <div className="bg-whale-bg/50 rounded-lg p-4 border border-whale-border/50">
        <p className="text-whale-muted text-sm leading-relaxed">
          📡 Market intelligence briefing will appear here. Check back during market hours
          for automated analysis of your watchlist, sector movements, and whale activity.
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs text-whale-muted">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-whale-cyan" />
            Auto-generated
          </span>
          <span>Pre-market • Open • Close</span>
        </div>
      </div>
    </div>
  );
}
