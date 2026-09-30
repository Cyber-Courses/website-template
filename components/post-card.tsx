import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentMetadata } from "@next-md-blog/core";
import type { Locale } from "@/lib/i18n";
import { fmString, fmStringArray, fmTitle } from "@/lib/frontmatter";

export function PostCard({
  post,
  locale,
}: {
  post: ContentMetadata;
  locale: Locale;
}) {
  const fm = post.frontmatter;
  const date = fmString(fm, "date");
  const description = fmString(fm, "description");
  const tags = fmStringArray(fm, "tags");
  return (
    <Card className="group relative gap-3 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/15">
      <CardHeader className="gap-2">
        {date && (
          <time dateTime={date} className="text-xs font-medium text-muted-foreground">
            {new Date(date).toLocaleDateString(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        )}
        <CardTitle className="text-lg font-semibold tracking-tight">
          {/* Stretched link: the whole card is clickable; tags sit above it. */}
          <Link
            href={`/${locale}/blog/${post.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {fmTitle(post)}
          </Link>
        </CardTitle>
        {description && <CardDescription className="line-clamp-3">{description}</CardDescription>}
      </CardHeader>
      {tags.length > 0 && (
        <CardContent className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {tags.slice(0, 4).map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="relative z-10"
              render={<Link href={`/${locale}/blog/tags/${encodeURIComponent(t.toLowerCase())}`} />}
            >
              {t}
            </Badge>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
