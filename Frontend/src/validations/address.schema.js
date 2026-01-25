import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  addressLine1: z
    .string()
    .min(1, 'Address line 1 is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  addressLine2: z
    .string()
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be less than 100 characters'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .regex(/^[0-9]{5,10}$/, 'Postal code must be 5-10 digits'),
  country: z
    .string()
    .min(1, 'Country is required')
    .default('India'),
  isDefault: z
    .boolean()
    .default(false),
  label: z
    .enum(['home', 'work', 'other'])
    .default('home'),
});

// Checkout form schema
export const checkoutSchema = z.object({
  // Shipping address
  shippingAddress: addressSchema,
  // Billing address (optional - same as shipping by default)
  sameAsShipping: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
  // Payment method
  paymentMethod: z
    .enum(['cod', 'card', 'upi', 'netbanking'])
    .default('cod'),
  // Order notes
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
}).refine((data) => {
  if (!data.sameAsShipping) {
    return data.billingAddress !== undefined;
  }
  return true;
}, {
  message: 'Billing address is required when not same as shipping',
  path: ['billingAddress'],
});

// Type exports
export const AddressFormData = addressSchema;
export const CheckoutFormData = checkoutSchema;
