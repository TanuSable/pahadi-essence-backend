import { z } from 'zod';

const emailOrPhoneRefine = (data: { email?: string; phone?: string }): boolean => {
  return Boolean(data.email || data.phone);
};

const emailOrPhoneMessage = {
  message: 'Either email or phone is required',
  path: ['email'],
};

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address').optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number')
      .optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })
  .refine(emailOrPhoneRefine, emailOrPhoneMessage);

export const loginSchema = z
  .object({
    email: z.string().trim().email('Invalid email address').optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number')
      .optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine(emailOrPhoneRefine, emailOrPhoneMessage);
