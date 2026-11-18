import type { FaqItem, HowToFrontmatter } from "@next-md-blog/core";

/**
 * Visible counterparts of the post's `faq` / `howto` frontmatter.
 *
 * The same frontmatter feeds FAQPage / HowTo JSON-LD (via the collection's
 * schema graph). Google's structured-data guidelines require that markup to
 * describe content users can see on the page — JSON-LD with no visible
 * equivalent is "spammy structured data" and can earn a manual action. So
 * whenever a post declares either block, it is rendered here too.
 */

export type StructuredContentLabels = {
  faq: string;
  tools: string;
  supplies: string;
  totalTime: string;
  result: string;
};

/** Format an ISO 8601 duration (`PT1H30M`) as `1 h 30 min`; raw value if unparseable. */
function formatDuration(iso: string): string {
  const m = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return iso;
  const [, d, h, min, s] = m;
  const parts = [
    d && `${d} d`,
    h && `${h} h`,
    min && `${min} min`,
    s && `${s} s`,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : iso;
}

export function PostHowTo({
  howto,
  fallbackName,
  labels,
}: {
  howto: HowToFrontmatter;
  fallbackName: string;
  labels: StructuredContentLabels;
}) {
  if (!howto.steps?.length) return null;
  const facts: [string, string][] = [];
  if (howto.totalTime) facts.push([labels.totalTime, formatDuration(howto.totalTime)]);
  if (howto.tool?.length) facts.push([labels.tools, howto.tool.join(", ")]);
  if (howto.supply?.length) facts.push([labels.supplies, howto.supply.join(", ")]);
  if (howto.yield) facts.push([labels.result, howto.yield]);

  return (
    <section
      id="how-to"
      aria-labelledby="how-to-heading"
      className="mt-12 scroll-mt-20 rounded-lg border p-6"
    >
      <h2 id="how-to-heading" className="text-2xl font-semibold tracking-tight">
        {howto.name ?? fallbackName}
      </h2>
      {howto.description && (
        <p className="mt-2 text-muted-foreground">{howto.description}</p>
      )}
      {facts.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
          {facts.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="font-medium">{term}</dt>
              <dd className="text-muted-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <ol className="mt-6 space-y-4">
        {howto.steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold">{step.name}</h3>
              <p className="mt-1 text-muted-foreground">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PostFaq({
  faq,
  labels,
}: {
  faq: FaqItem[];
  labels: StructuredContentLabels;
}) {
  if (!faq.length) return null;
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mt-12 scroll-mt-20">
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
        {labels.faq}
      </h2>
      <div className="mt-4 divide-y rounded-lg border">
        {faq.map((item, i) => (
          // Collapsed answers are fine for FAQPage: the text is in the DOM and
          // one click away (Google treats expandable sections as visible).
          <details key={i} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-medium marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
