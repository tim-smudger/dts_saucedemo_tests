export function getCredentials(role: "standard" | "locked" | "slow") {
  const credentialsMap = {
    standard: {
      username: process.env.STANDARD_USER!,
      password: process.env.PASSWORD_FOR_ALL!,
    },
    locked: {
      username: process.env.LOCKED_USER!,
      password: process.env.PASSWORD_FOR_ALL!,
    },
    slow: {
      username: process.env.TIMEOUT_TEST_USER!,
      password: process.env.PASSWORD_FOR_ALL!,
    },
  };
  return credentialsMap[role];
}
