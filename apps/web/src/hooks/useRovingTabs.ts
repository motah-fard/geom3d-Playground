"use client";

import { useRef, type KeyboardEvent } from "react";

// WAI-ARIA APG tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):
// only the active tab sits in the page tab order (tabindex 0, the rest -1),
// and Arrow/Home/End move focus *and* activate the tab directly — matching
// how these widgets already activate immediately on click, so there's no
// separate "confirm with Enter/Space" step to add.
export function useRovingTabs<T extends string>(
  ids: readonly T[],
  activeId: T,
  onActivate: (id: T) => void,
  orientation: "horizontal" | "vertical" = "horizontal",
) {
  const tabRefs = useRef(new Map<T, HTMLElement>());

  const registerTab = (id: T) => (el: HTMLElement | null) => {
    if (el) tabRefs.current.set(id, el);
    else tabRefs.current.delete(id);
  };

  const focusAndActivate = (id: T) => {
    tabRefs.current.get(id)?.focus();
    onActivate(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const index = ids.indexOf(activeId);
    if (index === -1) return;
    const forwardKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const backwardKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

    if (event.key === forwardKey) {
      event.preventDefault();
      focusAndActivate(ids[(index + 1) % ids.length]);
    } else if (event.key === backwardKey) {
      event.preventDefault();
      focusAndActivate(ids[(index - 1 + ids.length) % ids.length]);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAndActivate(ids[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAndActivate(ids[ids.length - 1]);
    }
  };

  const getTabProps = (id: T) => ({
    ref: registerTab(id),
    tabIndex: activeId === id ? 0 : -1,
    onKeyDown,
  });

  return { getTabProps };
}
