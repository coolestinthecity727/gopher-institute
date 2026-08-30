import { customAlphabet } from "nanoid";

const digits = customAlphabet("0123456789", 5);
const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

export function generateApplicationNo() {
  const year = new Date().getFullYear();
  return `GIF-APP-${year}-${digits()}`;
}

export function generateStudentNumber() {
  const year = new Date().getFullYear();
  return `GIF-${year}-${digits()}`;
}

export function generateCertificateNo() {
  const year = new Date().getFullYear();
  return `GIF-CERT-${year}-${digits()}`;
}

export function generateVerificationCode() {
  return codeAlphabet();
}
