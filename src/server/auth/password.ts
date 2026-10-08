import "server-only";
import { hash, verify } from "@node-rs/argon2";

// argon2id (the library default) with OWASP's recommended minimum: 19 MiB, 2 iterations, 1 lane.
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const MIN_PASSWORD_LENGTH = 12;

export const hashPassword = (password: string) => hash(password, OPTIONS);

export async function verifyPassword(stored: string, password: string) {
  try {
    return await verify(stored, password);
  } catch {
    return false;
  }
}

// Verified against when the email is unknown so response time does not reveal which emails exist.
let dummyHash: Promise<string> | undefined;
export const getDummyHash = () => (dummyHash ??= hashPassword("timing-equaliser-not-a-real-password"));
