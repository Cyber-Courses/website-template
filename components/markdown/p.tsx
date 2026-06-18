import type { ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { MdEmbed } from "./embed";

/**
 * Paragraph override that keeps the markup valid HTML5:
 *  - a paragraph that is just a bare URL becomes a rich oEmbed (`MdEmbed`);
 *  - an image-only paragraph is unwrapped (our `<img>`/`<figure>` is flow
 *    content and can't legally nest inside `<p>` — react-markdown wraps lone
 *    images in `<p>` by default).
 *
 * Both cases return WITHOUT a `<p>` wrapper, which also avoids hydration
 * mismatches from invalid nesting.
 */
export function MdParagraph({
  node,
  children,
  ...rest
}: ComponentProps<"p"> & ExtraProps) {
  const bareUrl = extractBareUrl(node);
  if (bareUrl) return <MdEmbed url={bareUrl} />;
  if (isImageOnly(node)) return <>{children}</>;
  return <p {...rest}>{children}</p>;
}

/** True when the paragraph contains only image(s) and whitespace. */
function isImageOnly(node: ExtraProps["node"]): boolean {
  if (!node || node.children.length === 0) return false;
  return node.children.every(
    (c) =>
      (c.type === "element" && c.tagName === "img") ||
      (c.type === "text" && c.value.trim() === ""),
  );
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
