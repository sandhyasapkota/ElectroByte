// Auth validation schemas
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileUpdateSchema,
} from './auth.schema';

// Address validation schemas
export {
  addressSchema,
  checkoutSchema,
} from './address.schema';

// Contact/Support validation schemas
export {
  contactSchema,
  ticketSchema,
  ticketReplySchema,
} from './contact.schema';

// Product validation schemas
export {
  productSchema,
  reviewSchema,
  categorySchema,
  brandSchema,
} from './product.schema';

// Repair/Appointment validation schemas
export {
  appointmentSchema,
  trackRepairSchema,
  repairStatusSchema,
} from './repair.schema';
