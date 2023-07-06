import { toast } from "react-toastify";

export default function ToastTest() {
  return (
    <div>
      <button
        onClick={() => {
          toast("I'm a toast", {
            isLoading: true,
            autoClose: false,
          });
        }}
        className="px-2 border-2 rounded-md"
      >
        Create Toast
      </button>
    </div>
  );
}
