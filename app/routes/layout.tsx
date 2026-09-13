import { Outlet, useLoaderData } from "react-router";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { getCart, getCartCount } from "~/services/cart.server";
import { getBusiness } from "~/config/business";

export async function loader({ request }: { request: Request }) {
  const cart = await getCart(request);
  return { cartCount: getCartCount(cart), business: getBusiness() };
}

export default function PublicLayout() {
  const { cartCount, business } = useLoaderData<typeof loader>();

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="min-h-screen pt-20">
        <Outlet />
      </main>
      <Footer business={business} />
    </>
  );
}
