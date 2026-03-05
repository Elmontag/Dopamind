import { useRef, useCallback } from "react";

const LONG_PRESS_DELAY = 500; // ms
const SCROLL_TOLERANCE = 8; // px — movement within this range doesn't cancel drag

/**
 * useTouchDragDrop — provides touch-based drag-and-drop support.
 *
 * Uses a native (non-passive) touchmove listener so e.preventDefault() works
 * and page scrolling is suppressed during an active drag.
 *
 * Usage:
 *   const { getTouchDragProps, getTouchDropProps } = useTouchDragDrop({ onDrop });
 *   <div {...getTouchDragProps(myData)} />
 *   <div {...getTouchDropProps(dropId)} />
 */
export function useTouchDragDrop({ onDrop }) {
  // Store onDrop in a ref so getTouchDragProps remains stable across renders
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const stateRef = useRef({
    dragData: null,
    dragEl: null,
    startX: 0,
    startY: 0,
    longPressTimer: null,
    isDragging: false,
    nativeMoveHandler: null, // native touchmove handler (non-passive)
  });

  const cleanup = useCallback(() => {
    const s = stateRef.current;
    if (s.longPressTimer) {
      clearTimeout(s.longPressTimer);
      s.longPressTimer = null;
    }
    if (s.dragEl) {
      s.dragEl.classList.remove("touch-dragging");
      // Remove the non-passive native listener to avoid leaks
      if (s.nativeMoveHandler) {
        s.dragEl.removeEventListener("touchmove", s.nativeMoveHandler);
        s.nativeMoveHandler = null;
      }
    }
    document.body.classList.remove("touch-drag-active");
    s.dragData = null;
    s.dragEl = null;
    s.isDragging = false;
  }, []);

  const getTouchDragProps = useCallback((dragData) => ({
    onTouchStart(e) {
      const touch = e.touches[0];
      const s = stateRef.current;
      s.startX = touch.clientX;
      s.startY = touch.clientY;
      s.dragData = dragData;
      s.dragEl = e.currentTarget;

      s.longPressTimer = setTimeout(() => {
        s.isDragging = true;
        s.dragEl.classList.add("touch-dragging");
        document.body.classList.add("touch-drag-active");
        if (typeof navigator.vibrate === "function") navigator.vibrate(50);
      }, LONG_PRESS_DELAY);

      // Register a non-passive touchmove listener directly on the element.
      // React registers touch listeners as passive, making e.preventDefault() a
      // no-op. A native {passive:false} listener is the only reliable way to
      // prevent the page from scrolling while a drag is in progress.
      const nativeMoveHandler = (e) => {
        const t = e.touches[0];
        if (!t) return;
        const dx = t.clientX - s.startX;
        const dy = t.clientY - s.startY;

        if (!s.isDragging) {
          // Cancel long-press if finger moves too much before threshold
          if (Math.abs(dx) > SCROLL_TOLERANCE || Math.abs(dy) > SCROLL_TOLERANCE) {
            if (s.longPressTimer) {
              clearTimeout(s.longPressTimer);
              s.longPressTimer = null;
            }
          }
          return;
        }

        // Suppress page scroll during active drag
        e.preventDefault();
      };

      s.nativeMoveHandler = nativeMoveHandler;
      e.currentTarget.addEventListener("touchmove", nativeMoveHandler, { passive: false });
    },

    onTouchEnd(e) {
      const s = stateRef.current;

      if (s.longPressTimer) {
        clearTimeout(s.longPressTimer);
        s.longPressTimer = null;
      }

      if (!s.isDragging) {
        cleanup();
        return;
      }

      // Determine drop target from touch position
      const touch = e.changedTouches[0];
      // Temporarily hide dragging element so elementFromPoint can find what's below
      if (s.dragEl) s.dragEl.style.pointerEvents = "none";
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (s.dragEl) s.dragEl.style.pointerEvents = "";

      // Walk up DOM to find nearest element with data-droptarget
      let dropEl = el;
      while (dropEl && !dropEl.dataset.droptarget) {
        dropEl = dropEl.parentElement;
      }

      if (dropEl && dropEl.dataset.droptarget && onDropRef.current) {
        onDropRef.current(s.dragData, dropEl.dataset.droptarget);
      }

      cleanup();
    },

    onTouchCancel() {
      cleanup();
    },
  }), [cleanup]);

  const getTouchDropProps = useCallback((dropId) => ({
    "data-droptarget": dropId,
  }), []);

  return { getTouchDragProps, getTouchDropProps };
}
