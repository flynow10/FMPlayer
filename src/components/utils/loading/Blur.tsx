import LoadingSpinner from "@/src/components/utils/loading/LoadingSpinner";

export function Blur() {
  return (
    <div className="absolute top-0 left-0 w-full h-full backdrop-blur">
      <div className="text-3xl absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        <LoadingSpinner />
      </div>
    </div>
  );
}
