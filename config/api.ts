import { getVercelEnvironment } from "../api-lib/constants.js";
import { getDebugConfig } from "./debug.config.js";

export function getApiDebugConfig() {
  if (getVercelEnvironment() === "development") {
    return getDebugConfig();
  }
  return null;
}
