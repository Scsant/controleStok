import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  delta?: number; // absolute change
  deltaPercent?: number; // percent change
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export default function StatCard({ title, value, delta, deltaPercent, icon, href, onClick, ariaLabel }: StatCardProps) {
  const positive = (delta || 0) >= 0;

  const handleKey = (e: React.KeyboardEvent) => {
    if (!onClick && !href) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
      if (href) window.location.href = href;
    }
  };

  const container = (
    <div
      role={onClick || href ? 'button' : undefined}
      tabIndex={0}
      aria-label={ariaLabel || title}
      aria-describedby={delta !== undefined ? `${title}-delta` : undefined}
      onKeyDown={handleKey}
      onClick={() => {
        if (onClick) onClick();
        if (href) window.location.href = href;
      }}
      className="p-4 rounded-xl backdrop-blur-md bg-white/15 border border-white/20 text-white hover:-translate-y-1 hover:shadow-lg transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/30"
      style={{ minHeight: 120, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-white/80 truncate">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
        {icon ? (
          <div className="shrink-0 ml-2">{icon}</div>
        ) : null}
      </div>

      {delta !== undefined || deltaPercent !== undefined ? (
        <div className="mt-3 flex items-center gap-2 text-sm" aria-live="polite">
          <span id={`${title}-delta`} className={`flex items-center gap-2 ${positive ? 'text-green-300' : 'text-rose-300'}`}>
            {positive ? <ArrowUp className="w-4 h-4" aria-hidden /> : <ArrowDown className="w-4 h-4" aria-hidden />}
            <span className="font-medium">{positive ? '+' : ''}{delta ?? 0}</span>
          </span>
          {deltaPercent !== undefined ? (
            <span className="text-white/70">({positive ? '+' : ''}{deltaPercent}% )</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return container;
}
