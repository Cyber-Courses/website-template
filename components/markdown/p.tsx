import type { ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { MdEmbed } from "./embed";

/**
 * Paragraph override that turns a paragraph containing nothing but a single
 * bare URL into a rich oEmbed (see `MdEmbed`). GFM autolinks bare URLs to
 * `<a href="url">url</a>`, so we detect that exact shape from the hast `node`.
 *
 * Returning the embed WITHOUT a `<p>` wrapper is deliberate: an <iframe>/<div>
 * nested inside <p> is invalid HTML and breaks hydration.
 */
export function MdParagraph({
  node,
  children,
  ...rest
}: ComponentProps<"p"> & ExtraProps) {
  const bareUrl = extractBareUrl(node);
  if (bareUrl) return <MdEmbed url={bareUrl} />;
  return <p {...rest}>{children}</p>;
}

function extractBareUrl(node: ExtraProps["node"]): string | null {
  if (!node || node.children.length !== 1) return null;
  const child = node.children[0];
  if (child.type !== "element" || child.tagName !== "a") return null;
  const href = child.properties?.href;
  if (typeof href !== "string") return null;
  const text = child.children[0];
  if (child.children.length !== 1 || text?.type !== "text") return null;
  // Only a *bare* autolink (visible text === target). A labelled link like
  // `[watch](url)` keeps its normal inline rendering.
  const normalize = (s: string) => s.replace(/\/$/, "");
  return normalize(text.value) === normalize(href) ? href : null;
}
