import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-jest.ts"],
  modulePaths: ["src"],
  moduleDirectories: ["node_modules"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^@/api/(.*)$": "<rootDir>/src/api/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/Music/(.*)$": "<rootDir>/src/Music/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: ["./src/**/*.(ts|tsx|js|jsx)"],
  coverageReporters: ["cobertura", "lcov"],
};
export default config;
