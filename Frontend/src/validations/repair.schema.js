import { z } from 'zod';

// Repair appointment schema
export const appointmentSchema = z.object({
  deviceType: z
    .enum(['laptop', 'desktop', 'mobile', 'tablet', 'other'], {
      required_error: 'Device type is required',
    }),
  deviceBrand: z
    .string()
    .min(1, 'Device brand is required')
    .max(100, 'Brand must be less than 100 characters'),
  deviceModel: z
    .string()
    .min(1, 'Device model is required')
    .max(100, 'Model must be less than 100 characters'),
  issueDescription: z
    .string()
    .min(1, 'Issue description is required')
    .min(20, 'Please provide more details about the issue (at least 20 characters)')
    .max(2000, 'Description must be less than 2000 characters'),
  preferredDate: z
    .string()
    .min(1, 'Preferred date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, {
      message: 'Date cannot be in the past',
    }),
  preferredTime: z
    .enum(['09:00-12:00', '12:00-15:00', '15:00-18:00'], {
      required_error: 'Preferred time slot is required',
    }),
  // Contact info
  contactName: z
    .string()
    .min(1, 'Contact name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  contactPhone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  contactEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  // Address
  address: z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be less than 500 characters'),
  // Additional notes
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

// Track repair schema
export const trackRepairSchema = z.object({
  trackingToken: z
    .string()
    .min(1, 'Tracking token is required')
    .min(8, 'Invalid tracking token'),
});

// Repair status update schema (for technicians)
export const repairStatusSchema = z.object({
  status: z
    .enum(['pending', 'diagnosing', 'repairing', 'completed', 'cancelled'], {
      required_error: 'Status is required',
    }),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  estimatedCost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional()
    .nullable(),
  actualCost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional()
    .nullable(),
});

// Type exports
export const AppointmentFormData = appointmentSchema;
export const TrackRepairFormData = trackRepairSchema;
export const RepairStatusFormData = repairStatusSchema;
