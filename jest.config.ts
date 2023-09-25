import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-jest.ts"],
  passWithNoTests: true,
  testPathIgnorePatterns: ["/src/tests/.*"],
  modulePaths: ["src"],
  moduleDirectories: ["node_modules"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^@/api-lib/(.*)$": "<rootDir>/api-lib/$1",
    "^@/config/(.*)$": "<rootDir>/config/$1",
  },
  collectCoverage: false,
  // collectCoverageFrom: ["./src/**/*.(ts|tsx|js|jsx)"],
  coverageReporters: ["cobertura", "lcov"],
};
export default config;
