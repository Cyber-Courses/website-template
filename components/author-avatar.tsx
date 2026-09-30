import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Author photo, or initials on a brand tint when no `avatar` is set in
 * site.config — so the template looks finished before real photos exist.
 */
export function AuthorAvatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const base = cn(
    "shrink-0 rounded-full ring-1 ring-foreground/10",
    className,
  );
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn(base, "object-cover")}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        base,
        "inline-flex items-center justify-center bg-brand-100 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300",
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </span>
  );
}
