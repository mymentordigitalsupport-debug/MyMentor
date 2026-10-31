export default function TodayLoading() {
  return (
    <div className="member-dashboard member-skeleton" role="status" aria-label="Loading your dashboard" aria-busy="true">
      <div className="member-skeleton-title" />
      <div className="member-skeleton-hero" />
      <div className="member-stats">{[0, 1, 2, 3].map((item) => <div className="member-skeleton-stat" key={item} />)}</div>
      <div className="member-dashboard-grid">{[0, 1].map((item) => <div className="member-skeleton-panel" key={item} />)}</div>
      <span className="member-sr-only">Loading your personal space.</span>
    </div>
  );
}
