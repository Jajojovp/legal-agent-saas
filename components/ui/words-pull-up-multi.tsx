'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface StyleSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: StyleSegment[];
  className?: string;
}

export function WordsPullUpMultiStyle({ segments, className = '' }: WordsPullUpMultiStyleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  // Flatten segments into individual words with their corresponding class
  const words = segments.flatMap((segment) => 
    segment.text.split(' ').filter(w => w.trim() !== '').map((word) => ({
      word,
      className: segment.className || ''
    }))
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={`inline-flex flex-wrap justify-center gap-x-[0.2em] gap-y-[0.1em] ${className}`}
    >
      {words.map((obj, i) => (
        <motion.span
          key={i}
          variants={item}
          className={`inline-block ${obj.className}`}
        >
          {obj.word}
        </motion.span>
      ))}
    </motion.div>
  );
}
