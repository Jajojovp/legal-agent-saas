'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedLetterProps {
  text: string;
  className?: string;
}

function AnimatedChar({ char, index, total }: { char: string; index: number; total: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });
  const progress = index / total;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, progress - 0.1), Math.min(1, progress + 0.05)],
    [0.2, 1]
  );

  return (
    <motion.span ref={ref} style={{ opacity }}>
      {char}
    </motion.span>
  );
}

export function AnimatedLetter({ text, className = '' }: AnimatedLetterProps) {
  const chars = text.split('');

  return (
    <div className={`inline ${className}`}>
      {chars.map((char, i) => (
        <AnimatedChar key={i} char={char} index={i} total={chars.length} />
      ))}
    </div>
  );
}
