import { z } from 'zod';

// Product schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0.01, 'Price must be greater than 0')
    .max(10000000, 'Price is too high'),
  discountPrice: z
    .number()
    .min(0, 'Discount price cannot be negative')
    .optional()
    .nullable(),
  categoryId: z
    .number({ invalid_type_error: 'Category is required' })
    .min(1, 'Please select a category'),
  brandId: z
    .number({ invalid_type_error: 'Brand is required' })
    .min(1, 'Please select a brand'),
  stock_quantity: z
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  sku: z
    .string()
    .max(50, 'SKU must be less than 50 characters')
    .optional(),
  specifications: z
    .string()
    .max(5000, 'Specifications must be less than 5000 characters')
    .optional(),
  warranty: z
    .string()
    .max(500, 'Warranty info must be less than 500 characters')
    .optional(),
  isActive: z
    .boolean()
    .default(true),
  isFeatured: z
    .boolean()
    .default(false),
}).refine((data) => {
  if (data.discountPrice && data.discountPrice >= data.price) {
    return false;
  }
  return true;
}, {
  message: 'Discount price must be less than regular price',
  path: ['discountPrice'],
});

// Product review schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: z
    .string()
    .min(1, 'Review title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  review: z
    .string()
    .min(1, 'Review is required')
    .min(20, 'Review must be at least 20 characters')
    .max(2000, 'Review must be less than 2000 characters'),
});

// Category schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  isActive: z
    .boolean()
    .default(true),
});

// Brand schema
export const brandSchema = z.object({
  name: z
    .string()
    .min(1, 'Brand name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  isActive: z
    .boolean()
    .default(true),
});

// Type exports
export const ProductFormData = productSchema;
export const ReviewFormData = reviewSchema;
export const CategoryFormData = categorySchema;
export const BrandFormData = brandSchema;
