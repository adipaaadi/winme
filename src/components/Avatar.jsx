function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const sizes = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-20 w-20 text-2xl',
  xl: 'h-24 w-24 text-3xl',
};

export default function Avatar({
  name,
  gradient = 'from-navy-700 to-navy-900',
  size = 'md',
  className = '',
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-display font-semibold tracking-wide text-cream ring-1 ring-inset ring-cream/20 ${gradient} ${sizes[size]} ${className}`}
    >
      <span className="drop-shadow-sm">{initials(name)}</span>
    </div>
  );
}
