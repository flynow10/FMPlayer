import { Loader2 } from "lucide-react";

export function Blur() {
  return (
    <div className="absolute top-0 left-0 w-full h-full backdrop-blur">
      <h1 className="text-3xl absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        Loading <Loader2 className="inline animate-spin" />
      </h1>
    </div>
  );
}
