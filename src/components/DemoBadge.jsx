export default function DemoBadge({ className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-coral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy ${className}`}
    >
      {children || 'Demo'}
    </span>
  );
}
