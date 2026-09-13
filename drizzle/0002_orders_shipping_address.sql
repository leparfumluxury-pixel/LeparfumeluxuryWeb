ALTER TABLE "orders" ADD COLUMN "shipping_address_line1" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address_line2" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_city" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_state" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_pincode" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_country" text DEFAULT 'India';