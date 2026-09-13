import { Link, useLoaderData } from "react-router";
import { PolicyPage } from "~/components/layout/PolicyPage";
import { formatAddressSingleLine, getBusiness } from "~/config/business";

export function meta() {
  const business = getBusiness();
  return [
    { title: `Terms and Conditions — ${business.displayName}` },
    {
      name: "description",
      content: `Terms of sale for ${business.legalName}, including orders, pricing, and use of this website.`,
    },
  ];
}

export function loader() {
  return { business: getBusiness() };
}

export default function TermsPage() {
  const { business } = useLoaderData<typeof loader>();

  return (
    <PolicyPage title="Terms and Conditions">
      <p>
        These terms govern purchases from {business.legalName} through this
        website. By placing an order you agree to them.
      </p>

      <h2>The seller</h2>
      <p>
        Goods are sold by {business.legalName},{" "}
        {formatAddressSingleLine(business.address)}.
      </p>

      <h2>Orders and pricing</h2>
      <p>
        Prices are listed in INR on our <Link to="/pricing">pricing</Link> and
        product pages and include applicable GST. An order is confirmed when
        payment is successfully captured. We may cancel an order if an item is
        unavailable, in which case we will refund you in full.
      </p>

      <h2>Payment</h2>
      <p>
        Payments are processed by Razorpay. You must provide accurate contact
        and shipping details. Title to goods passes to you on delivery; risk
        passes when the parcel is handed to the courier.
      </p>

      <h2>Shipping and returns</h2>
      <p>
        Delivery and returns are described in our{" "}
        <Link to="/shipping">Shipping Policy</Link> and{" "}
        <Link to="/refunds">Cancellation and Refund Policy</Link>.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You may not misuse the site, attempt unauthorised access, or use
        content for commercial purposes without our written consent. Product
        images and copy belong to {business.legalName}.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent permitted by Indian law, our liability for any order is
        limited to the amount you paid for that order. This does not affect
        your statutory consumer rights.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <Link to="/contact">Contact Us</Link> or{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a>.
      </p>
    </PolicyPage>
  );
}
