import { Link, useLoaderData } from "react-router";
import { PolicyPage } from "~/components/layout/PolicyPage";
import { formatAddressSingleLine, getBusiness } from "~/config/business";

export function meta() {
  const business = getBusiness();
  return [
    { title: `Privacy Policy — ${business.displayName}` },
    {
      name: "description",
      content: `How ${business.legalName} collects, uses, and protects your personal information.`,
    },
  ];
}

export function loader() {
  return { business: getBusiness() };
}

export default function PrivacyPage() {
  const { business } = useLoaderData<typeof loader>();

  return (
    <PolicyPage title="Privacy Policy">
      <p>
        This policy explains how {business.legalName} (“we”, “us”) handles
        personal information when you browse or buy from our website.
      </p>

      <h2>Information we collect</h2>
      <p>We collect information you give us at checkout and in messages:</p>
      <ul>
        <li>Name, email, and phone number</li>
        <li>Shipping address</li>
        <li>Order and payment status from Razorpay (we do not store full card numbers)</li>
        <li>Basic site usage needed to run the shop (cart, session)</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use this information to fulfil orders, send order updates, handle
        refunds, prevent fraud, and meet tax and legal duties. We do not sell
        your personal information.
      </p>

      <h2>Sharing</h2>
      <p>
        We share data only with service providers who help us operate the
        store — payment processing (Razorpay), hosting, and delivery partners
        — and when the law requires it.
      </p>

      <h2>Retention</h2>
      <p>
        We keep order records as required under Indian tax and consumer law.
        You may ask us to correct or delete information that we are not
        required to retain.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy requests, write to{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a> or visit{" "}
        <Link to="/contact">Contact Us</Link>.
      </p>
      <p>
        {business.legalName}
        <br />
        {formatAddressSingleLine(business.address)}
      </p>
    </PolicyPage>
  );
}
