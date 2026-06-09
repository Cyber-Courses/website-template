import { MdImage } from "./img";
import { MdLink } from "./a";
import { MdParagraph } from "./p";
import type { MarkdownComponents } from "@next-md-blog/core";

/**
 * Component overrides passed to <MarkdownContent components={markdownComponents} />.
 * Default styling comes from Tailwind's prose class (article element wrapper).
 */
export const markdownComponents: MarkdownComponents = {
  img: MdImage as MarkdownComponents["img"],
  a: MdLink as MarkdownComponents["a"],
  // Bare-URL paragraphs become rich oEmbeds (YouTube, Vimeo, …).
  p: MdParagraph as MarkdownComponents["p"],
};
