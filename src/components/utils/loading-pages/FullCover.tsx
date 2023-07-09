import { Loader2 } from "lucide-react";

export function FullCover() {
  return (
    <div className="relative w-full h-full">
      <h1 className="text-3xl absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        Loading <Loader2 className="inline animate-spin" />
      </h1>
    </div>
  );
}
