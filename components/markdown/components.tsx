import type { ComponentType } from "react";
import { MdImage } from "./img";
import { MdLink } from "./a";
import { MdParagraph } from "./p";
import {
  defaultMarkdownComponents,
  type MarkdownComponents,
} from "@next-md-blog/core";

/**
 * react-markdown hands every component its hast `node`. The library's default
 * components spread all props onto the DOM element, which renders an invalid
 * `node="[object Object]"` attribute on headings, lists, code, em/strong…
 * Wrap each default so the `node` prop is dropped before it reaches the DOM.
 */
function withoutNode<P extends object>(
  Component: ComponentType<P>,
): ComponentType<P & { node?: unknown }> {
  function Wrapped(allProps: P & { node?: unknown }) {
    const props: Record<string, unknown> = { ...allProps };
    delete props.node;
    return <Component {...(props as P)} />;
  }
  Wrapped.displayName = `WithoutNode(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}

const defaults = Object.fromEntries(
  Object.entries(defaultMarkdownComponents).map(([tag, Component]) => [
    tag,
    withoutNode(Component as ComponentType<object>),
  ]),
) as MarkdownComponents;

/**
 * Component overrides passed to <MarkdownContent components={markdownComponents} />.
 * Default styling comes from Tailwind's prose class (article element wrapper).
 */
export const markdownComponents: MarkdownComponents = {
  ...defaults,
  img: MdImage as MarkdownComponents["img"],
  a: MdLink as MarkdownComponents["a"],
  // Bare-URL paragraphs become rich oEmbeds (YouTube, Vimeo, …).
  p: MdParagraph as MarkdownComponents["p"],
};
