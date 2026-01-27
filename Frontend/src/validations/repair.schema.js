import { z } from 'zod';

const appointmentTimeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];

const deviceTypes = [
  'Laptop',
  'Desktop',
  'Mobile Phone',
  'Tablet',
  'Monitor',
  'Printer',
  'Other',
];

// Repair appointment schema (BookRepair form)
export const appointmentSchema = z.object({
  appointmentDate: z
    .string()
    .min(1, 'Appointment date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      if (Number.isNaN(selectedDate.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, {
      message: 'Date cannot be in the past',
    }),
  appointmentTime: z
    .string()
    .min(1, 'Appointment time is required')
    .refine((time) => appointmentTimeSlots.includes(time), {
      message: 'Invalid time slot',
    }),
  deviceType: z
    .string()
    .min(1, 'Device type is required')
    .refine((type) => deviceTypes.includes(type), {
      message: 'Invalid device type',
    }),
  deviceBrand: z
    .string()
    .max(100, 'Brand must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  issueDescription: z
    .string()
    .min(1, 'Issue description is required')
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(2000, 'Description must be less than 2000 characters'),
  pickupRequired: z
    .boolean()
    .default(false),
  pickupAddress: z
    .string()
    .max(500, 'Pickup address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.pickupRequired) {
    const address = data.pickupAddress || '';
    if (address.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pickup address is required (min 10 characters)',
        path: ['pickupAddress'],
      });
    }
  }
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
