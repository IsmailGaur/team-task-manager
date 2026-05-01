const { body, param } = require('express-validator');

// Project validators
const createProjectValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

// Task validators
const createTaskValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),

  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
];

const updateStatusValidators = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status'),
];

module.exports = { createProjectValidators, createTaskValidators, updateStatusValidators };
