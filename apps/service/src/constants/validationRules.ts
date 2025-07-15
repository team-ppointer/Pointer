export const NAME_VALIDATION_RULES = {
  required: {
    value: true,
    message: '',
  },
  minLength: {
    value: 2,
    message: '',
  },
  maxLength: {
    value: 5,
    message: '',
  },
};

export const GRADE_VALIDATION_RULES = {
  required: {
    value: true,
    message: '',
  },
  pattern: {
    value: /^[1-3]$/,
    message: '',
  },
};
