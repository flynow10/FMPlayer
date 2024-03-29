import ToastTest from "@/src/components/utils/ToastTest";
import UUID from "@/src/components/utils/UUID";

import { Pages } from "@/src/types/pages";

type DebugToolbarProps = {
  onNavigate: (
    location: Pages.Location,
    navigateType: Pages.NavigationType,
    pageData?: Pages.PageStore
  ) => void;
  location: Pages.Location;
};

export default function DebugToolbar(props: DebugToolbarProps) {
  return (
    <div className="flex flex-row gap-2">
      <UUID />
      <ToastTest />
      <div>
        <button
          className="px-2 border-2 rounded-md"
          onClick={() =>
            props.onNavigate(props.location, "new", {
              type: "testing page",
            })
          }
        >
          Go To Test Page
        </button>
      </div>
    </div>
  );
}
