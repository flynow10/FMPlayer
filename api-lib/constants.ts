export const USER_TOKEN = "user-token";

export const DEFAULT_PAGE_LIMIT = 2e9;

export function getJwtSecretKey(): string {
  return getEnvVar("JWT_SECRET_KEY");
}

export type VercelEnv = "development" | "preview" | "production";

export function getVercelEnvironment(): VercelEnv {
  return getEnvVar("VERCEL_ENV") as VercelEnv;
}

export function getEnvVar(variableName: string, defaultValue?: string): string {
  const environmentVariable = process.env[variableName];
  if (environmentVariable === undefined || environmentVariable.length === 0) {
    if (defaultValue === undefined) {
      throw new Error(`The environment variable ${variableName} is not set.`);
    } else {
      return defaultValue;
    }
  }
  return environmentVariable;
}
