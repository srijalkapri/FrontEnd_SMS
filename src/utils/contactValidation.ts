const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_PATTERN = /^[\d\s+\-().]+$/;
const PHONE_DIGIT_COUNT = 10;

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();

  if (!trimmed) {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

export function validatePhoneNumber(phoneNumber: string): string | undefined {
  const trimmed = phoneNumber.trim();

  if (!trimmed) {
    return 'Phone number is required.';
  }
  if (!PHONE_CHARS_PATTERN.test(trimmed)) {
    return 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign.';
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length !== PHONE_DIGIT_COUNT) {
    return `Phone number must be exactly ${PHONE_DIGIT_COUNT} digits.`;
  }

  return undefined;
}
