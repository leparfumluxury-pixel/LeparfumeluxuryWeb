import { Link, useLoaderData } from "react-router";
import { PolicyPage } from "~/components/layout/PolicyPage";
import { getBusiness } from "~/config/business";

export function meta() {
  const business = getBusiness();
  return [
    { title: `Shipping Policy — ${business.displayName}` },
    {
      name: "description",
      content: `Dispatch and delivery timelines for ${business.legalName} orders in India.`,
    },
  ];
}

export function loader() {
  return { business: getBusiness() };
}

export default function ShippingPage() {
  const { business } = useLoaderData<typeof loader>();

  return (
    <PolicyPage title="Shipping Policy">
      <p>
        {business.legalName} ships perfume orders across India from Bengaluru.
        Shipping is free on all orders.
      </p>

      <h2>Dispatch</h2>
      <p>
        Orders are packed and handed to the courier within{" "}
        <strong className="text-cream">{business.policies.dispatch}</strong>{" "}
        after payment is confirmed, excluding Sundays and public holidays.
      </p>

      <h2>Delivery</h2>
      <p>
        Typical delivery within India is{" "}
        <strong className="text-cream">{business.policies.deliveryIndia}</strong>{" "}
        after dispatch. Remote pin codes may take longer. You will receive
        tracking details by email or SMS when available.
      </p>

      <h2>Address</h2>
      <p>
        Please enter a complete Indian shipping address at checkout. We cannot
        be responsible for delays or failed delivery caused by an incomplete
        or incorrect address.
      </p>

      <h2>Failed delivery</h2>
      <p>
        If a parcel is returned to us because it could not be delivered, we
        will contact you to arrange a re-shipment. Extra courier charges, if
        any, may apply.
      </p>

      <h2>Cancellations</h2>
      <p>
        To cancel before we ship, see our{" "}
        <Link to="/refunds">Cancellation and Refund Policy</Link> or{" "}
        <Link to="/contact">contact us</Link>.
      </p>
    </PolicyPage>
  );
}
