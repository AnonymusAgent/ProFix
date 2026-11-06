import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  compact?: boolean;
  light?: boolean;
}

/**
 * ProFix brand mark.
 *
 * The badge pairs a bold "P" wrench silhouette with an orange bolt —
 * plumbing + electrical, the two trades ProFix is built around.
 * The artwork lives in /public/logo.svg so the header, footer, auth
 * screens and favicon all stay on the same mark.
 */
export default function Logo({ className, compact = false, light = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img
        src="/logo.svg"
        alt="ProFix Services logo"
        className="size-10 shrink-0 rounded-[10px] shadow-lg shadow-navy/20"
        width={40}
        height={40}
      />
      {!compact && (
        <span className="flex flex-col">
          <span className={cn('text-xl font-display font-bold leading-none', light ? 'text-white' : 'text-foreground')}>
            Pro<span className="text-brand-orange">Fix</span>
          </span>
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.18em] leading-none mt-1',
              light ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            Services
          </span>
        </span>
      )}
    </span>
  );
}
