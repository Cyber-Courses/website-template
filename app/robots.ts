import type { MetadataRoute } from "next";
import { getRobots } from "@next-md-blog/core/next";
import { site } from "@/next-md-blog.config";

export default function robots(): MetadataRoute.Robots {
  return {
    ...getRobots(site),
    // Keep crawlers off non-indexable routes to save crawl budget:
    // internal search results (noindex) and the oEmbed machine endpoint.
    rules: { userAgent: "*", allow: "/", disallow: ["/*/search", "/oembed"] },
  };
}
