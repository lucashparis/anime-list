export function Skeleton({ className }: { className: string }) {
  return <div className={`bg-neutral-100 motion-safe:animate-pulse ${className}`} />;
}
