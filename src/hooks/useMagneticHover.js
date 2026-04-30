import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'motion/react';

/**
 * Returns motion values (rotateX, rotateY, z) + event handlers for a 3D card tilt effect.
 * The card tilts up to `maxTilt` degrees toward the cursor as you move over it.
 */
const useMagneticHover = (maxTilt = 10) => {
  const ref = useRef(null);

  const rotateX = useSpring(0, { stiffness: 200, damping: 22, mass: 0.4 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 22, mass: 0.4 });
  const z       = useSpring(0, { stiffness: 200, damping: 22, mass: 0.4 });

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const cx = (e.clientX - left) / width  - 0.5;   // -0.5 … +0.5
    const cy = (e.clientY - top)  / height - 0.5;
    rotateY.set(cx * maxTilt * 2);
    rotateX.set(-cy * maxTilt * 2);
    z.set(8);
  }, [rotateX, rotateY, z, maxTilt]);

  const onMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    z.set(0);
  }, [rotateX, rotateY, z]);

  return { ref, rotateX, rotateY, z, onMouseMove, onMouseLeave };
};

export default useMagneticHover;
