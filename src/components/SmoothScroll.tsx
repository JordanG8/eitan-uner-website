"use client";

import { useEffect } from "react";

const WHEEL_DISTANCE_LIMIT = 180;
const REVERSE_DEAD_ZONE = 24;
const FOLLOW_TIME_MS = 92;

function canScrollVertically(element: Element) {
  const style = window.getComputedStyle(element);
  return /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight;
}

function isInsideIndependentScroller(target: EventTarget | null) {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.documentElement) {
    if (canScrollVertically(element)) return true;
    element = element.parentElement;
  }

  return false;
}

/**
 * Adds restrained momentum to discrete desktop mouse-wheel input.
 *
 * Trackpads, touch, keyboard navigation, nested scrollers and reduced-motion
 * users keep the browser's native behavior. The short reversal dead zone is
 * deliberate: it prevents a tiny opposite wheel tick from making a pinned
 * scroll animation chatter on the exact boundary between two beats.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (reduceMotion.matches || coarsePointer.matches) return;

    let currentY = window.scrollY;
    let targetY = currentY;
    let frame = 0;
    let previousTime = performance.now();
    let direction = 0;
    let reverseDistance = 0;
    let writingScroll = false;

    const maximumY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clampY = (value: number) => Math.min(maximumY(), Math.max(0, value));

    const animate = (time: number) => {
      const elapsed = Math.min(40, time - previousTime);
      previousTime = time;
      const follow = 1 - Math.exp(-elapsed / FOLLOW_TIME_MS);
      currentY += (targetY - currentY) * follow;

      if (Math.abs(targetY - currentY) < 0.35) currentY = targetY;

      writingScroll = true;
      window.scrollTo(0, currentY);
      writingScroll = false;

      if (currentY !== targetY) frame = requestAnimationFrame(animate);
      else frame = 0;
    };

    const onWheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        isInsideIndependentScroller(event.target)
      ) {
        return;
      }

      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
      const rawDelta = event.deltaY * unit;
      if (rawDelta === 0) return;

      const nextDirection = Math.sign(rawDelta);
      let acceptedDelta = Math.max(-WHEEL_DISTANCE_LIMIT, Math.min(WHEEL_DISTANCE_LIMIT, rawDelta));

      if (direction && nextDirection !== direction) {
        reverseDistance += Math.abs(acceptedDelta);
        if (reverseDistance < REVERSE_DEAD_ZONE) {
          event.preventDefault();
          return;
        }
        acceptedDelta = nextDirection * (reverseDistance - REVERSE_DEAD_ZONE);
        reverseDistance = 0;
      } else {
        reverseDistance = 0;
      }

      direction = nextDirection;
      targetY = clampY(targetY + acceptedDelta);
      event.preventDefault();

      if (!frame) {
        currentY = window.scrollY;
        previousTime = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };

    const onScroll = () => {
      if (writingScroll || frame) return;
      currentY = window.scrollY;
      targetY = currentY;
    };

    const onResize = () => {
      targetY = clampY(targetY);
      currentY = clampY(currentY);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
