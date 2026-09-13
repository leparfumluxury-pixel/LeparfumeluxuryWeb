import { useLoaderData } from "react-router";
import {
  formatAddressLines,
  getBusiness,
  phoneHref,
} from "~/config/business";

export function meta() {
  const business = getBusiness();
  return [
    { title: `Contact Us — ${business.displayName}` },
    {
      name: "description",
      content: `Reach ${business.legalName} in Bengaluru. Address, phone, and email for orders and support.`,
    },
  ];
}

export function loader() {
  return { business: getBusiness() };
}

export default function ContactPage() {
  const { business } = useLoaderData<typeof loader>();
  const lines = formatAddressLines(business.address);

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
        Get in Touch
      </p>
      <h1 className="font-heading text-4xl lg:text-5xl text-cream mb-6">
        Contact Us
      </h1>
      <p className="text-cream-muted leading-relaxed mb-12">
        We are based in Bengaluru and happy to help with orders, shipping, and
        fragrance questions.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="font-heading text-2xl text-cream mb-3">
            {business.legalName}
          </h2>
          <address className="not-italic text-cream-muted leading-relaxed">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </section>

        <section className="space-y-3 text-cream-muted">
          <p>
            Phone:{" "}
            <a
              href={phoneHref(business.phone)}
              className="text-gold hover:text-gold-light"
            >
              {business.phone}
            </a>
          </p>
          <p>
            Email:{" "}
            <a
              href={`mailto:${business.email}`}
              className="text-gold hover:text-gold-light"
            >
              {business.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
