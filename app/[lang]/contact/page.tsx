import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/site.config";
import { LOCALES, type Locale } from "@/lib/i18n";
import { staticPageMetadata } from "@/lib/metadata";
import { homeCrumb } from "@/lib/breadcrumbs";
import { getDictionary, hasLocale } from "../dictionaries";

type Params = { lang: string };

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return staticPageMetadata({
    lang,
    path: "/contact",
    title: "Contact",
    description: `Get in touch with ${siteConfig.name}.`,
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang;
  const dict = await getDictionary(locale);
  const url = `${siteConfig.url}/${lang}/contact`;
  const { contactPoint, address } = siteConfig.organization;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": url,
          url,
          name: "Contact",
          inLanguage: locale,
          isPartOf: { "@id": `${siteConfig.url}/#website` },
          about: { "@id": `${siteConfig.url}/#organization` },
          mainEntity: {
            "@type": "Organization",
            "@id": `${siteConfig.url}/#organization`,
            name: siteConfig.name,
            contactPoint: {
              "@type": "ContactPoint",
              email: contactPoint.email,
              telephone: contactPoint.telephone,
              contactType: contactPoint.contactType,
              areaServed: contactPoint.areaServed,
              availableLanguage: contactPoint.availableLanguage,
            },
            address: {
              "@type": "PostalAddress",
              ...address,
            },
          },
        }}
      />
      <main
        id="main-content"
        className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert"
      >
        <Breadcrumbs
          items={[homeCrumb(locale, dict), { name: "Contact" }]}
        />
        <h1>Contact</h1>
        <p>The fastest way to reach us:</p>
        <ul>
          <li>
            Email:{" "}
            <a href={`mailto:${contactPoint.email}`}>{contactPoint.email}</a>
          </li>
          {contactPoint.telephone && (
            <li>
              Phone:{" "}
              <a href={`tel:${contactPoint.telephone}`}>
                {contactPoint.telephone}
              </a>
            </li>
          )}
        </ul>
        <h2>Postal address</h2>
        <address className="not-italic">
          {siteConfig.organization.legalName}
          <br />
          {address.streetAddress}
          <br />
          {address.postalCode} {address.addressLocality}
          <br />
          {address.addressCountry}
        </address>
      </main>
    </>
  );
}
