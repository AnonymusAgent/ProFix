import { Droplets, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Trade = 'plumber' | 'electrician';

/**
 * The two worker sections: plumbers and electricians pick their trade here
 * during worker sign-up (and when completing a profile after first login).
 */
export default function TradePicker({
  value,
  onChange,
}: {
  value: Trade | null;
  onChange: (trade: Trade) => void;
}) {
  const options: { id: Trade; title: string; blurb: string; icon: typeof Droplets }[] = [
    {
      id: 'plumber',
      title: 'Plumbers',
      blurb: 'Pipe repairs, leaks, drains, water heaters & emergency plumbing.',
      icon: Droplets,
    },
    {
      id: 'electrician',
      title: 'Electricians',
      blurb: 'Wiring, panels, lighting, smart home & emergency electrical.',
      icon: Zap,
    },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {options.map(({ id, title, blurb, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={cn(
            'text-left rounded-xl border p-4 transition-all',
            value === id
              ? 'border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange/40'
              : 'border-border bg-card hover:border-brand-orange/50',
          )}
        >
          <span className="flex items-center gap-2 font-display font-bold text-foreground">
            <span className={cn(
              'flex items-center justify-center size-9 rounded-lg',
              value === id ? 'bg-brand-orange text-white' : 'bg-muted text-muted-foreground',
            )}>
              <Icon className="size-5" />
            </span>
            {title}
          </span>
          <span className="block text-sm text-muted-foreground mt-2 leading-relaxed">{blurb}</span>
        </button>
      ))}
    </div>
  );
}
