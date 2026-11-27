import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

/** Thin brand-colour bar showing scroll position. Invisible at the top of the page. */
export default function ScrollProgress() {
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const opacity = useTransform(scrollY, [0, 24], [0, 1]);
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, opacity }}
      className="fixed inset-x-0 top-0 z-30 h-0.5 origin-left bg-brand pointer-events-none"
    />
  );
}
