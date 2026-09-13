import { Link, useLoaderData } from "react-router";
import { PolicyPage } from "~/components/layout/PolicyPage";
import { getBusiness } from "~/config/business";

export function meta() {
  const business = getBusiness();
  return [
    { title: `Cancellation and Refund Policy — ${business.displayName}` },
    {
      name: "description",
      content: `Cancellation windows and refund timelines for ${business.legalName}.`,
    },
  ];
}

export function loader() {
  return { business: getBusiness() };
}

export default function RefundsPage() {
  const { business } = useLoaderData<typeof loader>();

  return (
    <PolicyPage title="Cancellation and Refund Policy">
      <p>
        This policy covers cancellations and refunds for orders placed with{" "}
        {business.legalName}.
      </p>

      <h2>Cancellation</h2>
      <p>
        You may cancel an order{" "}
        <strong className="text-cream">{business.policies.cancellation}</strong>.
        Write to us at{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a> with your
        order reference. Once a parcel has been dispatched, it cannot be
        cancelled; you may refuse delivery and request a return as below.
      </p>

      <h2>Returns</h2>
      <p>
        Fragrance is a hygiene-sensitive product. We accept returns only if
        the bottle is unopened, unused, and in its original sealed packaging,
        and you contact us within 48 hours of delivery for a damaged, leaking,
        or incorrect item.
      </p>
      <p>
        Opened or used fragrances cannot be returned or refunded, except where
        Indian consumer law requires otherwise (for example, a manufacturing
        defect).
      </p>

      <h2>Refunds</h2>
      <p>
        Approved refunds are processed to the original payment method within{" "}
        <strong className="text-cream">{business.policies.refunds}</strong>.
        Your bank or card issuer may take additional time to credit the
        amount.
      </p>
      <p>
        If we cancel an order because an item is unavailable, we refund the
        full amount automatically on the same timeline.
      </p>

      <h2>How to request</h2>
      <p>
        Email <a href={`mailto:${business.email}`}>{business.email}</a> or use{" "}
        <Link to="/contact">Contact Us</Link> with your order number, reason,
        and photos if the item arrived damaged.
      </p>
    </PolicyPage>
  );
}
