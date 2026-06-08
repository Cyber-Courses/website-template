/**
 * oEmbed 1.0 response object (https://oembed.com/#section2.3).
 * All four types share a common base; type-specific fields are optional here
 * and narrowed at the render site.
 */
export type OEmbedType = "photo" | "video" | "link" | "rich";

export interface OEmbedResponse {
  type: OEmbedType;
  version: "1.0" | string;
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number | string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  /** Required for `photo`. */
  url?: string;
  /** Required for `video` and `rich`. */
  html?: string;
  width?: number | null;
  height?: number | null;
}
