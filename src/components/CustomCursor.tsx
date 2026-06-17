import { useEffect, useRef, useState } from 'react';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const canUseCursor = window.matchMedia('(pointer: fine)').matches;
    if (!canUseCursor) return;

    document.body.classList.add('custom-cursor-enabled');

    const moveCursor = (event: PointerEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      setIsVisible(true);
    };

    const hideCursor = () => setIsVisible(false);
    const showCursor = () => setIsVisible(true);
    const pressCursor = () => setIsPressed(true);
    const releaseCursor = () => setIsPressed(false);

    window.addEventListener('pointermove', moveCursor);
    window.addEventListener('pointerleave', hideCursor);
    window.addEventListener('pointerenter', showCursor);
    window.addEventListener('pointerdown', pressCursor);
    window.addEventListener('pointerup', releaseCursor);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('pointermove', moveCursor);
      window.removeEventListener('pointerleave', hideCursor);
      window.removeEventListener('pointerenter', showCursor);
      window.removeEventListener('pointerdown', pressCursor);
      window.removeEventListener('pointerup', releaseCursor);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isVisible ? 'visible' : ''} ${isPressed ? 'pressed' : ''}`}
      aria-hidden="true"
    >
      <span className="custom-cursor-core" />
    </div>
  );
};
