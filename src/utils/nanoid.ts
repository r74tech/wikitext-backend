import { customAlphabet } from 'nanoid';

// Create a custom nanoid generator with a URL-safe alphabet
// Using a custom alphabet without special characters for better URL compatibility
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

export function generateNanoid(): string {
  return nanoid();
}