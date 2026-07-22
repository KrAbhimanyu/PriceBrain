export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="aspect-square bg-slate-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
        <div className="h-5 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 w-20 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
