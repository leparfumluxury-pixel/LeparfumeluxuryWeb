import { Link } from "react-router";
import {
  BUSINESS,
  formatAddressLines,
  phoneHref,
  type BusinessInfo,
} from "~/config/business";

const exploreLinks = [
  { to: "/products", label: "Collection" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Journal" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const policyLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/shipping", label: "Shipping" },
  { to: "/refunds", label: "Refunds" },
];

export function Footer({ business = BUSINESS }: { business?: BusinessInfo }) {
  const addressLines = formatAddressLines(business.address);

  return (
    <footer className="bg-noir-surface border-t border-noir-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="py-16 lg:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-block group"
              aria-label={business.displayName}
            >
              <img
                src="/logo.png"
                alt={business.displayName}
                className="h-14 w-auto opacity-95 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
            <p className="mt-6 text-cream-muted text-sm leading-relaxed max-w-md">
              Luxury fragrances from Bengaluru. Each scent is composed for
              those who want something lasting and considered.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg tracking-wide text-cream mb-6">
              Explore
            </h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-cream-muted hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg tracking-wide text-cream mb-6">
              Atelier
            </h4>
            <ul className="space-y-3 text-sm text-cream-muted">
              {addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>
                <a
                  href={phoneHref(business.phone)}
                  className="hover:text-gold transition-colors duration-300"
                >
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="hover:text-gold transition-colors duration-300"
                >
                  {business.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-noir-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-dark tracking-wider">
            © {new Date().getFullYear()} {business.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-cream-dark tracking-wider">
            {policyLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
