import { useRef, useCallback } from "react";

const LONG_PRESS_DELAY = 500; // ms
const SCROLL_TOLERANCE = 8; // px — movement within this range doesn't cancel drag

/**
 * useTouchDragDrop — provides touch-based drag-and-drop support.
 *
 * Usage:
 *   const { getTouchDragProps, getTouchDropProps } = useTouchDragDrop({
 *     onDrop: (dragData, dropTarget) => { ... }
 *   });
 *
 *   // On draggable element:
 *   <div {...getTouchDragProps(myData)} />
 *
 *   // On drop zone element (must have data-droptarget attribute):
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
  });

  const cleanup = useCallback(() => {
    const s = stateRef.current;
    if (s.longPressTimer) {
      clearTimeout(s.longPressTimer);
      s.longPressTimer = null;
    }
    if (s.dragEl) {
      s.dragEl.classList.remove("touch-dragging");
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
    },
    onTouchMove(e) {
      const s = stateRef.current;
      const touch = e.touches[0];
      const dx = touch.clientX - s.startX;
      const dy = touch.clientY - s.startY;

      // If significant movement before long-press triggers, cancel long-press
      if (!s.isDragging) {
        if (Math.abs(dx) > SCROLL_TOLERANCE || Math.abs(dy) > SCROLL_TOLERANCE) {
          if (s.longPressTimer) {
            clearTimeout(s.longPressTimer);
            s.longPressTimer = null;
          }
        }
        return;
      }

      // Prevent page scrolling during drag
      e.preventDefault();
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

      // Walk up DOM to find the nearest element with data-droptarget
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
