export default function AppLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-secondary" />
        <div className="h-7 w-48 rounded bg-secondary" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-secondary" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-secondary" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
