export const BUSINESS = {
  legalName: "Le Parfume Luxury",
  displayName: "Le Parfume Luxury",
  shortName: "LE PARFUME",
  tagline: "Luxury",
  email: "hello@leparfumeluxury.com",
  phone: "+91 XXXXX XXXXX",
  address: {
    floor: "Basement",
    shop: "Shop No 31",
    building: "Maruti Plaza",
    street: "UM Lane",
    locality: "Basettypet Huriopet Chickpet",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    pincode: "560053",
    country: "India",
  },
  policies: {
    dispatch: "1–2 business days",
    deliveryIndia: "5–7 business days",
    cancellation: "before dispatch, or within 24 hours of placing the order — whichever is earlier",
    refunds: "5–7 business days after approval",
  },
} as const;

export type BusinessInfo = {
  legalName: string;
  displayName: string;
  shortName: string;
  tagline: string;
  email: string;
  phone: string;
  address: typeof BUSINESS.address;
  policies: typeof BUSINESS.policies;
};

export function getBusiness(): BusinessInfo {
  return {
    ...BUSINESS,
    email: process.env.BUSINESS_EMAIL || BUSINESS.email,
    phone: process.env.BUSINESS_PHONE || BUSINESS.phone,
  };
}

export function formatAddressLines(address = BUSINESS.address): string[] {
  return [
    `${address.floor}, ${address.shop}`,
    address.building,
    `${address.street}, ${address.locality}`,
    `${address.city}, ${address.district}, ${address.state} ${address.pincode}`,
    address.country,
  ];
}

export function formatAddressSingleLine(address = BUSINESS.address): string {
  return [
    address.floor,
    address.shop,
    address.building,
    address.street,
    address.locality,
    address.city,
    address.district,
    address.state,
    address.pincode,
  ].join(", ");
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
