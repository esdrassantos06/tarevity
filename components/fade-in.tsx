'use client';
import { motion, useInView, Variants } from 'motion/react';
import * as React from 'react';

export function FadeIn({
  direction,
  children,
  className = '',
  staggerChildren = 0.1,
  once = false,
}: {
  direction: 'up' | 'down';
  children: React.ReactNode;
  className?: string;
  staggerChildren?: number;
  once?: boolean;
}) {
  const FADE_DOWN = {
    show: { opacity: 1, y: 0, transition: { type: 'spring' } },
    hidden: { opacity: 0, y: direction === 'down' ? -18 : 18 },
  };
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once });
  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={isInView ? 'show' : ''}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerChildren,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? (
          <motion.div variants={FADE_DOWN as Variants}>{child}</motion.div>
        ) : (
          child
        ),
      )}
    </motion.div>
  );
}
