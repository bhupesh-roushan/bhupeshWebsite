import { createRoot } from "react-dom/client";
import { ToastContainer, toast } from "react-toastify";

/** Its own React root, so it needs no place in the app tree and no import there. */
export function mountToasts() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const light = document.documentElement.dataset.theme === "light";
  createRoot(el).render(
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={light ? "light" : "dark"}
    />
  );
  return el;
}

export { toast };
