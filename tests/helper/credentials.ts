import { env } from "../../environments";

export type Role = "standard" | "locked" | "slow";

export function getCredentials(role: Role) {
  return env.users[role];
}
