import { useCallback, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { roleBySlug } from "../data/roles";

const PARAM = "role";
const KEY = "role-view";

// The role is remembered for the tab's session, not for good: a link someone
// was sent shouldn't still be reordering the page next month, and sessionStorage
// is gone when the tab is. It can also be unavailable (private mode, blocked
// storage), in which case the URL alone carries the role, which is the
// degraded-but-working case.
const read = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const write = (slug) => {
  try {
    if (slug) sessionStorage.setItem(KEY, slug);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* the URL still holds it */
  }
};

/**
 * The active role view, and a setter.
 *
 * The URL is what a link carries, so `?role=` wins; the stored role fills in
 * when a navigation has dropped it (see `useRoleSync`). Read during render, so
 * the page never paints once without the role and then again with it.
 * Unknown values are ignored as if absent.
 */
export function useRole() {
  const [params, setParams] = useSearchParams();
  const role = roleBySlug(params.get(PARAM)) ?? roleBySlug(read());

  // Storage first, so the render the URL change triggers already agrees with it.
  const setRole = useCallback(
    (slug) => {
      write(slug ?? null);
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (slug) next.set(PARAM, slug);
          else next.delete(PARAM);
          return next;
        },
        // A view is a setting, not a place: Back should leave the page, not
        // step through the roles that were tried.
        { replace: true }
      );
    },
    [setParams]
  );

  return { role, setRole };
}

/**
 * Keeps `?role=` on the URL as the visitor moves around, without any link
 * having to know about it.
 *
 * Plenty of navigation drops the query — the navbar's `/#about` anchors are
 * full page loads, `navigate("/projects/x")` and the modal's close replace it
 * outright — and threading the param through every one of them would be a
 * change to each and a thing to forget in the next. So the URL is allowed to
 * lose it, and this puts it back, with `replace` so no extra history entry
 * appears. A role arriving in the URL is remembered the same way.
 *
 * Mount once, anywhere under the router.
 */
export function useRoleSync() {
  const { pathname, search, hash, state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const fromUrl = roleBySlug(params.get(PARAM));
    if (fromUrl) {
      if (read() !== fromUrl.slug) write(fromUrl.slug);
      return;
    }
    // A role param that is present but not one of ours is left alone.
    if (params.has(PARAM)) return;
    const stored = roleBySlug(read());
    if (!stored) return;
    params.set(PARAM, stored.slug);
    navigate({ pathname, search: `?${params}`, hash }, { replace: true, state });
  }, [pathname, search, hash, state, navigate]);
}
