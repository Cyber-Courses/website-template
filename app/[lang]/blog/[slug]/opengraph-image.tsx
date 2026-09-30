import { renderOgImage, ogSize } from "@/lib/og";
import { blog } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { getDictionary, hasLocale } from "../../dictionaries";

export const runtime = "nodejs";
export const alt = "Blog post";
export const size = ogSize;
export const contentType = "image/png";

type Params = { lang: string; slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) {
    return renderOgImage({ title: siteConfig.name });
  }
  const [post, dict] = await Promise.all([
    blog.getOne(slug, { locale: lang }),
    getDictionary(lang),
  ]);
  const title = (post?.frontmatter.title as string) ?? slug;
  const description =
    (post?.frontmatter.description as string) ?? siteConfig.description;
  return renderOgImage({ title, description, eyebrow: dict.nav.blog });
}
