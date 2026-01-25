import { z } from 'zod';

// Contact form schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

// Support ticket schema
export const ticketSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  category: z
    .enum(['general', 'order', 'product', 'technical', 'billing', 'other'])
    .default('general'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  orderId: z
    .string()
    .optional(),
});

// Ticket reply schema
export const ticketReplySchema = z.object({
  message: z
    .string()
    .min(1, 'Reply message is required')
    .min(5, 'Reply must be at least 5 characters')
    .max(2000, 'Reply must be less than 2000 characters'),
});

// Type exports
export const ContactFormData = contactSchema;
export const TicketFormData = ticketSchema;
export const TicketReplyFormData = ticketReplySchema;
