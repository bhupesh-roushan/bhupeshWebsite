/**
 * Toasts, loaded when the first one is needed.
 *
 * react-toastify is 30KB, and the only things that ever raise a toast are
 * sending a message and a failed copy — neither happens for most visitors, yet
 * the library and its container used to ship in the entry chunk for all of
 * them. This keeps the call site the same shape (`notify("success", "...")`)
 * and moves the cost to the click that needs it.
 */
let host = null;

export async function notify(kind, message) {
  const { toast, mountToasts } = await import("./toastRuntime.jsx");
  host ??= mountToasts();
  toast[kind](message);
}
