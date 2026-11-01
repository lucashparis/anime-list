type LogoSize = 'sm' | 'lg';

const sizeClassName: Record<LogoSize, string> = {
  lg: 'text-xl',
  sm: 'text-lg',
};

export function Logo({ size }: { size: LogoSize }) {
  return (
    <span className={`${sizeClassName[size]} font-regular text-white uppercase`}>
      Busc<span className="text-warning">Anime</span>
    </span>
  );
}
