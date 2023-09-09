import { getVercelEnvironment } from "@/api-lib/constants";
import { getDebugConfig } from "./debug.config";

export function getApiDebugConfig() {
  if (getVercelEnvironment() === "development") {
    return getDebugConfig();
  }
  return null;
}
