import { IS_LOCAL } from "@/src/utils/vercel-env";

import { getDebugConfig } from "./debug.config";

export function getApplicationDebugConfig() {
  if (IS_LOCAL) {
    return getDebugConfig();
  }
  return null;
}
