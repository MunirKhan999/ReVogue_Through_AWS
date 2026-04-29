
export function Skeleton({ className = "", ...props }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} {...props} />;
}
