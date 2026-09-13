import { Link, NavLink, useNavigation } from "react-router";
import { useState } from "react";
import { BUSINESS } from "~/config/business";

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <>
      {/* Loading bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[100]">
          <div className="h-full gold-gradient animate-[shimmer_1s_ease-in-out_infinite] bg-[length:200%_100%]" />
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 glass-surface">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center group"
              id="logo-link"
              aria-label={BUSINESS.displayName}
            >
              <img
                src="/logo.png"
                alt={BUSINESS.displayName}
                className="h-10 lg:h-12 w-auto opacity-95 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `text-sm tracking-[0.15em] uppercase hover-gold-border pb-1 transition-colors duration-300 ${
                    isActive ? "text-gold" : "text-cream-muted hover:text-cream"
                  }`
                }
                id="nav-products"
              >
                Collection
              </NavLink>
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `text-sm tracking-[0.15em] uppercase hover-gold-border pb-1 transition-colors duration-300 ${
                    isActive ? "text-gold" : "text-cream-muted hover:text-cream"
                  }`
                }
                id="nav-blog"
              >
                Journal
              </NavLink>
              <Link
                to="/cart"
                className="relative group"
                id="nav-cart"
              >
                <svg
                  className="w-5 h-5 text-cream-muted group-hover:text-gold transition-colors duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-noir-bg text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              <Link to="/cart" className="relative" id="nav-cart-mobile">
                <svg
                  className="w-5 h-5 text-cream-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-noir-bg text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-cream-muted hover:text-cream transition-colors"
                id="mobile-menu-toggle"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-noir-border animate-slide-down">
            <div className="px-6 py-8 space-y-6">
              <NavLink
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-lg tracking-[0.15em] uppercase ${
                    isActive ? "text-gold" : "text-cream-muted"
                  }`
                }
              >
                Collection
              </NavLink>
              <NavLink
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-lg tracking-[0.15em] uppercase ${
                    isActive ? "text-gold" : "text-cream-muted"
                  }`
                }
              >
                Journal
              </NavLink>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
