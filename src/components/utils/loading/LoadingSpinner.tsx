import { Loader2 } from "lucide-react";

// type LoadingSpinnerProps = {};

export default function LoadingSpinner(/*props: LoadingSpinnerProps*/) {
  return (
    <span className="flex gap-2 p-2">
      Loading <Loader2 className="animate-spin my-auto" />
    </span>
  );
}
