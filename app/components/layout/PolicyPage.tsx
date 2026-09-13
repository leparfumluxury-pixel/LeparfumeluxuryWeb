import type { ReactNode } from "react";

export function PolicyPage({
  eyebrow = "Legal",
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
        {eyebrow}
      </p>
      <h1 className="font-heading text-4xl lg:text-5xl text-cream mb-10">
        {title}
      </h1>
      <div className="space-y-5 text-cream-muted leading-relaxed [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-cream [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-gold [&_a]:hover:text-gold-light">
        {children}
      </div>
    </div>
  );
}
