// Validation rules and utilities
export const VALIDATION_RULES = {
  name: {
    min: 2,
    max: 50,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    min: 8,
    max: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  },
  organization: {
    name: {
      min: 3,
      max: 100,
    },
    description: {
      max: 500,
    },
  },
};

export type ValidationError = {
  field: string;
  message: string;
};

export function validateEmail(email: string): ValidationError | null {
  if (!email || !email.trim()) {
    return { field: "email", message: "Email is required" };
  }
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return { field: "email", message: "Please enter a valid email address" };
  }
  return null;
}

export function validateName(name: string): ValidationError | null {
  if (!name || !name.trim()) {
    return { field: "name", message: "Name is required" };
  }
  if (name.trim().length < VALIDATION_RULES.name.min) {
    return {
      field: "name",
      message: `Name must be at least ${VALIDATION_RULES.name.min} characters`,
    };
  }
  if (name.length > VALIDATION_RULES.name.max) {
    return {
      field: "name",
      message: `Name must not exceed ${VALIDATION_RULES.name.max} characters`,
    };
  }
  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }
  if (password.length < VALIDATION_RULES.password.min) {
    return {
      field: "password",
      message: `Password must be at least ${VALIDATION_RULES.password.min} characters`,
    };
  }
  if (password.length > VALIDATION_RULES.password.max) {
    return {
      field: "password",
      message: `Password must not exceed ${VALIDATION_RULES.password.max} characters`,
    };
  }
  if (VALIDATION_RULES.password.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (VALIDATION_RULES.password.requireLowercase && !/[a-z]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (VALIDATION_RULES.password.requireNumber && !/[0-9]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one number",
    };
  }
  return null;
}

export function validateOrganizationName(name: string): ValidationError | null {
  if (!name || !name.trim()) {
    return {
      field: "organizationName",
      message: "Organization name is required",
    };
  }
  if (name.trim().length < VALIDATION_RULES.organization.name.min) {
    return {
      field: "organizationName",
      message: `Organization name must be at least ${VALIDATION_RULES.organization.name.min} characters`,
    };
  }
  if (name.length > VALIDATION_RULES.organization.name.max) {
    return {
      field: "organizationName",
      message: `Organization name must not exceed ${VALIDATION_RULES.organization.name.max} characters`,
    };
  }
  return null;
}

export function validateOrganizationDescription(
  description: string,
): ValidationError | null {
  if (
    description &&
    description.length > VALIDATION_RULES.organization.description.max
  ) {
    return {
      field: "description",
      message: `Description must not exceed ${VALIDATION_RULES.organization.description.max} characters`,
    };
  }
  return null;
}

export function validateSignupForm(
  name: string,
  email: string,
  password: string,
): ValidationError | null {
  const nameError = validateName(name);
  if (nameError) return nameError;

  const emailError = validateEmail(email);
  if (emailError) return emailError;

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  return null;
}
