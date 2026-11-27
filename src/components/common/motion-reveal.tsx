"use client";

import { MotionConfig, motion } from "motion/react";

/**
 * Subtle section reveal respecting OS reduced-motion without SSR/client markup divergence.
 */
export function MotionReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0.92, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.28, ease: "easeOut", delay }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
