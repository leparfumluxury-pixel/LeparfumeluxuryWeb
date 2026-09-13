import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import "dotenv/config";

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle({ client: sql, schema });

  console.log("🌱 Seeding database...\n");

  // Seed admin user
  const email = process.env.ADMIN_EMAIL || "admin@leparfumeluxury.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(schema.users).values({ email, passwordHash, role: "admin" }).onConflictDoNothing();
  console.log(`✓ Admin user: ${email}`);

  // Seed products
  const productData = [
    {
      name: "Velvet Oud",
      slug: "velvet-oud",
      description: "A sumptuous blend of rare oud wood and velvety rose, creating an unforgettable trail of sophistication. This masterpiece opens with bright bergamot before revealing its opulent heart.",
      price: 1299900,
      comparePrice: 1499900,
      category: "extrait",
      stock: 25,
      featured: true,
      published: true,
      images: ["/product-1.png"],
      notes: { top: ["Bergamot", "Saffron", "Pink Pepper"], middle: ["Rose Absolute", "Oud Wood", "Iris"], base: ["Sandalwood", "Amber", "Musk"] },
    },
    {
      name: "Noir Absolu",
      slug: "noir-absolu",
      description: "The essence of midnight distilled into a fragrance. Dark, mysterious, and utterly captivating. Noir Absolu is for those who command every room they enter.",
      price: 899900,
      category: "eau-de-parfum",
      stock: 50,
      featured: true,
      published: true,
      images: ["/product-2.png"],
      notes: { top: ["Black Pepper", "Cardamom", "Elemi"], middle: ["Leather", "Incense", "Violet Leaf"], base: ["Vetiver", "Patchouli", "Tonka Bean"] },
    },
    {
      name: "Jardin de Minuit",
      slug: "jardin-de-minuit",
      description: "A midnight garden in bloom — intoxicating white florals enveloped in the cool night air. Delicate yet powerful, like moonlight on jasmine petals.",
      price: 749900,
      category: "eau-de-parfum",
      stock: 35,
      featured: true,
      published: true,
      images: ["/product-3.png"],
      notes: { top: ["Neroli", "Green Notes", "Pear"], middle: ["Jasmine Sambac", "Tuberose", "Ylang Ylang"], base: ["White Musk", "Cedarwood", "Benzoin"] },
    },
    {
      name: "Ambre Royal",
      slug: "ambre-royal",
      description: "Liquid gold captured in glass. Ambre Royal wraps you in warmth and luxury with its rich amber accord, enhanced by precious resins and exotic spices.",
      price: 1099900,
      category: "collection-privee",
      stock: 15,
      featured: true,
      published: true,
      images: ["/product-4.png"],
      notes: { top: ["Cinnamon", "Nutmeg", "Orange Blossom"], middle: ["Amber", "Labdanum", "Olibanum"], base: ["Vanilla", "Oud", "Castoreum"] },
    },
  ];

  for (const p of productData) {
    await db.insert(schema.products).values(p).onConflictDoNothing();
  }
  console.log(`✓ ${productData.length} products seeded`);

  // Seed blog posts
  const blogData = [
    {
      title: "The Ancient Art of Oud",
      slug: "the-ancient-art-of-oud",
      excerpt: "Discover the centuries-old tradition of oud harvesting and why this precious ingredient remains the most coveted in perfumery.",
      content: "<p>Oud, often called 'liquid gold,' is one of the most expensive and sought-after ingredients in the world of perfumery. Derived from the heartwood of Aquilaria trees infected with a particular type of mold, oud has been treasured for thousands of years across cultures.</p><h2>A History Steeped in Tradition</h2><p>The use of oud dates back over 3,000 years. Ancient texts from India, China, and the Middle East all reference this precious material. In many cultures, oud was reserved for royalty and religious ceremonies.</p><h2>The Harvesting Process</h2><p>Only a small percentage of Aquilaria trees produce oud naturally. When the tree becomes infected with Phialophora parasitica mold, it produces a dark, fragrant resin as a defense mechanism. This process can take decades, making natural oud extraordinarily rare.</p>",
      coverImage: "",
      author: "Le Parfume Luxury",
      published: true,
    },
    {
      title: "Scent and Memory: The Invisible Thread",
      slug: "scent-and-memory",
      excerpt: "How fragrance connects us to our deepest memories and why choosing a signature scent is one of life's most personal decisions.",
      content: "<p>Of all our senses, smell has the most direct connection to memory and emotion. The olfactory bulb, which processes scent, is part of the brain's limbic system — the same area responsible for emotional memories.</p><h2>The Proust Effect</h2><p>Marcel Proust famously described how the scent of a madeleine dipped in tea transported him back to childhood. This phenomenon, now known as the Proust Effect, demonstrates the powerful link between scent and autobiographical memory.</p><h2>Choosing Your Signature</h2><p>A signature scent becomes part of your identity. It's the invisible impression you leave in every room, the olfactory fingerprint that people associate with your presence. Choose wisely — choose a fragrance that speaks to who you truly are.</p>",
      coverImage: "",
      author: "Le Parfume Luxury",
      published: true,
    },
  ];

  for (const b of blogData) {
    await db.insert(schema.blogPosts).values(b).onConflictDoNothing();
  }
  console.log(`✓ ${blogData.length} blog posts seeded`);

  // Seed coupons
  const couponData = [
    {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      active: true,
    },
    {
      code: "NOIR20",
      discountType: "percentage",
      discountValue: 20,
      active: true,
    },
    {
      code: "LUXURY500",
      discountType: "fixed",
      discountValue: 50000, // ₹500 off in paise
      active: true,
    },
  ];

  for (const c of couponData) {
    await db.insert(schema.coupons).values(c).onConflictDoNothing();
  }
  console.log(`✓ ${couponData.length} coupons seeded`);

  console.log("\n✅ Seeding complete!");
}

seed().catch(console.error);
