import LoadingSpinner from "@/src/components/utils/loading/LoadingSpinner";

export default function FullCover() {
  return (
    <div className="relative w-full h-full">
      <div className="text-3xl absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        <LoadingSpinner />
      </div>
    </div>
  );
}
