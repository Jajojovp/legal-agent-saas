'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
}

export function WordsPullUp({ text, className = '', showAsterisk = false }: WordsPullUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const words = text.split(' ');

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
      className={`inline-flex flex-wrap justify-center ${className}`}
    >
      {words.map((word, i) => {
        const isLastWord = i === words.length - 1;
        // Find if the word ends with 'a' and we need an asterisk
        let displayWord = word;
        let hasAsterisk = false;
        
        if (showAsterisk && isLastWord && word.toLowerCase().endsWith('a')) {
          hasAsterisk = true;
          displayWord = word.slice(0, -1);
        }

        return (
          <motion.span
            key={i}
            variants={item}
            className="inline-block relative mr-[0.2em]"
          >
            {displayWord}
            {hasAsterisk && (
              <>
                a
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] text-primary">*</span>
              </>
            )}
            {/* If it doesn't end with 'a' but we still wanted an asterisk, we just render the word normally */}
            {showAsterisk && isLastWord && !hasAsterisk && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] text-primary">*</span>
            )}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
