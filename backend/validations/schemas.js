const Joi = require('joi');

const recordSchema = Joi.object({
  amount: Joi.number().required(),
  currency: Joi.string().valid('$', '₹', '€').optional(),
  type: Joi.string().valid('Income', 'Expense').required(),
  category: Joi.string().required(),
  date: Joi.date().optional(),
  notes: Joi.string().allow('').optional(),
  name: Joi.string().allow('').optional()
});

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('Admin', 'Analyst', 'Viewer').optional(),
  status: Joi.string().valid('Active', 'Inactive').optional(),
  budget: Joi.number().optional()
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().optional(),
  type: Joi.string().valid('Income', 'Expense').optional(),
  category: Joi.string().optional(),
  date: Joi.date().optional(),
  notes: Joi.string().allow('').optional(),
  name: Joi.string().allow('').optional()
}).min(1);

module.exports = { recordSchema, userSchema, updateRecordSchema };
