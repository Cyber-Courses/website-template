import { logoMark } from "@/lib/brand";
import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";

/**
 * The brand mark. Geometry lives in `lib/brand.ts` (shared with the favicon
 * and OG images); colors follow the theme tokens so it adapts to dark mode.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={logoMark.viewBox}
      aria-hidden
      className={cn("size-7 shrink-0", className)}
    >
      <rect width="32" height="32" rx={logoMark.radius} className="fill-primary" />
      <path
        d={logoMark.fill}
        strokeWidth={1.5}
        strokeLinejoin="round"
        className="fill-primary-foreground stroke-primary-foreground"
      />
      <path
        d={logoMark.stroke}
        fill="none"
        strokeWidth={logoMark.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
    </svg>
  );
}

/** Mark + wordmark. The wordmark is just the site name set in the heading font. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark />
      <span className="truncate font-heading text-[0.95rem] font-semibold tracking-tight">
        {siteConfig.shortName}
      </span>
    </span>
  );
}
