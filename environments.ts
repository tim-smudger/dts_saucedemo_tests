const environments = {
  production: {
    baseURL: "https://www.saucedemo.com",
    users: {
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
    },
  },
  staging: {
    baseURL: "https://staging.saucedemo.com",
    users: {
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
    },
  },
  local: {
    baseURL: "http://localhost:3000",
    users: {
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
    },
  },
};

type EnvName = keyof typeof environments;

const envName = (process.env.ENV || "production") as EnvName;

if (!environments[envName]) {
  throw new Error(
    `Unknown environment: ${envName}. Valid options: ${Object.keys(environments).join(", ")}`,
  );
}

export const env = environments[envName];
