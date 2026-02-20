const { z } = require('zod');

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const numericInput = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .refine((value) => !Number.isNaN(value), 'Must be a valid number');

const positiveIntInput = numericInput
  .refine((value) => Number.isInteger(value), 'Must be an integer')
  .refine((value) => value > 0, 'Must be greater than 0');

const nonNegativeIntInput = numericInput
  .refine((value) => Number.isInteger(value), 'Must be an integer')
  .refine((value) => value >= 0, 'Must be 0 or greater');

const nonNegativeNumberInput = numericInput.refine((value) => value >= 0, 'Must be 0 or greater');

module.exports = {
  z,
  objectIdSchema,
  numericInput,
  positiveIntInput,
  nonNegativeIntInput,
  nonNegativeNumberInput
};
