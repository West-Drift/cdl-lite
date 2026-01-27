// lib/tokens.ts
import { randomBytes } from "crypto";

export function generateVerificationToken() {
  return randomBytes(32).toString("hex");
}

export function generatePasswordResetToken() {
  return randomBytes(32).toString("hex");
}
