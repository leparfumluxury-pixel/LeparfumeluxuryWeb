import { Link } from "react-router";
import { PolicyPage } from "~/components/layout/PolicyPage";
import {
  BUSINESS,
  formatAddressSingleLine,
} from "~/config/business";

export function meta() {
  return [
    { title: `About Us — ${BUSINESS.displayName}` },
    {
      name: "description",
      content: `${BUSINESS.legalName} is a luxury fragrance house based in Bengaluru, crafting artisanal perfumes for India.`,
    },
  ];
}

export default function AboutPage() {
  return (
    <PolicyPage eyebrow="Our Story" title={`About ${BUSINESS.displayName}`}>
      <p>
        {BUSINESS.legalName} is a luxury fragrance house based in Bengaluru.
        We compose artisanal perfumes from rare ingredients — oud, rose,
        amber, and vetiver — for those who want a scent that feels considered
        and lasting.
      </p>
      <p>
        Each bottle is sold under our registered business name, with prices in
        Indian Rupees and delivery across India. Browse the{" "}
        <Link to="/products">collection</Link> or see current{" "}
        <Link to="/pricing">pricing</Link>.
      </p>

      <h2>Registered business</h2>
      <p>
        Orders are fulfilled by{" "}
        <strong className="text-cream">{BUSINESS.legalName}</strong>.
      </p>
      <p>{formatAddressSingleLine()}</p>
      <p>
        Questions? Visit our <Link to="/contact">Contact Us</Link> page.
      </p>
    </PolicyPage>
  );
}
