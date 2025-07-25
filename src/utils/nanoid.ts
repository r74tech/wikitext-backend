import { customAlphabet } from "nanoid";
import { NANOID_CONFIG } from "../config/constants";

const nanoid = customAlphabet(NANOID_CONFIG.ALPHABET, NANOID_CONFIG.LENGTH);

export function generateNanoid(): string {
    return nanoid();
}
