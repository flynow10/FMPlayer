/* eslint-disable import/no-default-export */
import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup-jest.ts"],
  passWithNoTests: true,
  modulePaths: ["src"],
  moduleDirectories: ["node_modules"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^@/api-lib/(.*)$": "<rootDir>/api-lib/$1",
    "^@/config/(.*)$": "<rootDir>/config/$1",
  },
  collectCoverage: false,
  collectCoverageFrom: ["./src/**/*.(ts|js)"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { isolatedModules: true }],
  },
  coverageReporters: ["cobertura", "lcov"],
};
export default config;
