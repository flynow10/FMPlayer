import "jest-chain";
import "jest-extended/all";
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();
Object.defineProperty(global, "__APP_ENV__", {
  value: "testing",
  writable: false,
});
