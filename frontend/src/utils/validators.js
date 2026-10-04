export function validateName(name) {
  if (!name || !name.trim()) {
    return "Name is required";
  }
  const len = name.trim().length;
  if (len < 20 || len > 60) {
    return `Name must be between 20 and 60 characters (currently ${len})`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return "Email is required";
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return "Invalid email format";
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be between 8 and 16 characters (currently ${password.length})`;
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
}

export function validateAddress(address) {
  if (!address || !address.trim()) {
    return "Address is required";
  }
  if (address.trim().length > 400) {
    return `Address cannot exceed 400 characters (currently ${address.trim().length})`;
  }
  return null;
}
