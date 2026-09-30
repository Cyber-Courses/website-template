import { renderOgImage, ogSize } from "@/lib/og";
import { siteConfig } from "@/site.config";
import { getDictionary, hasLocale } from "./dictionaries";

export const runtime = "nodejs";
export const alt = siteConfig.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    return renderOgImage({ title: siteConfig.name, description: siteConfig.description });
  }
  const dict = await getDictionary(lang);
  return renderOgImage({
    title: dict.home.heading,
    description: dict.home.subheading,
  });
}
