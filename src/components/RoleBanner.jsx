import { lazy, Suspense } from "react";
import { useRole, useRoleSync } from "../hooks/useRole";

const RoleBannerBody = lazy(() => import("./RoleBannerBody"));

/**
 * "Showing the Backend Engineer view — 5 of 12 projects match. Clear"
 *
 * Fixed just under the navbar (h-16), so it never covers it, and below the menu
 * and modals in the stacking order. The status region itself is always in the
 * DOM — a live region that appears together with its text is often not
 * announced — and takes no space when empty.
 *
 * Also the one place `useRoleSync` is mounted, since it renders on every route.
 */
export const RoleBanner = () => {
  useRoleSync();
  const { role, setRole } = useRole();

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-16 z-30 print:hidden">
      {role && (
        <Suspense fallback={null}>
          <RoleBannerBody role={role} onClear={() => setRole(null)} />
        </Suspense>
      )}
    </div>
  );
};
