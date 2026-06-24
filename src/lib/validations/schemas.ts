import { z } from "zod";

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================
// CHECKOUT SCHEMAS
// ============================================================

export const couponValidateSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  subtotal: z.number().positive("Invalid subtotal"),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        type: z.enum(["course", "template"]),
        title: z.string().min(1),
        price: z.number().nonnegative(),
      })
    )
    .min(1, "Cart cannot be empty"),
  coupon_code: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  order_id: z.string().uuid("Invalid order ID"),
});

export type CouponValidateInput = z.infer<typeof couponValidateSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// ============================================================
// EDIT REQUEST SCHEMA
// ============================================================

export const editRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  description: z
    .string()
    .min(20, "Please describe your project in at least 20 characters")
    .max(2000),
  budget_range: z.string().optional(),
  reference_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type EditRequestInput = z.infer<typeof editRequestSchema>;

// ============================================================
// RESOURCE DOWNLOAD SCHEMA (email gate)
// ============================================================

export const resourceDownloadSchema = z.object({
  email: z.string().email("Valid email required"),
  resource_id: z.string().uuid("Invalid resource"),
});

export type ResourceDownloadInput = z.infer<typeof resourceDownloadSchema>;
