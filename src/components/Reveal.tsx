import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { sfx } from '../sound'
import { Burst } from './Particles'

export function Reveal({ correct, delta, message, onDone }: { correct: boolean; delta: number; message?: string; onDone: () => void }) {
  // Hold onDone in a ref so parent re-renders (which pass a fresh inline arrow)
  // don't cancel and restart the 3-second timeout. Without this, the timer keeps
  // resetting and the next question never loads.
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (correct) sfx.correct(); else sfx.wrong()
    const id = setTimeout(() => doneRef.current(), 3000)
    return () => clearTimeout(id)
  }, [correct])

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dim the content underneath so the verdict reads clearly */}
      <motion.div
        className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <div className="absolute inset-0" style={{ background: correct ? 'radial-gradient(circle at 50% 50%, rgba(89,243,177,0.45), transparent 60%)' : 'radial-gradient(circle at 50% 50%, rgba(255,122,89,0.45), transparent 60%)' }} />

      <motion.div
        initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
        animate={{
          scale: [0.4, 1.15, 1, 1.05, 1],
          rotate: [-8, 2, 0, -1, 0],
          opacity: [0, 1, 1, 1, 1]
        }}
        transition={{ duration: 2.8, times: [0, 0.18, 0.4, 0.7, 1], ease: 'easeOut' }}
        className="font-display font-black text-8xl md:text-9xl text-center px-8"
        style={{
          color: correct ? '#59F3B1' : '#FF7A59',
          textShadow: correct
            ? '0 0 60px #59F3B1, 0 0 12px #59F3B1, 0 6px 0 #0B0B18'
            : '0 0 60px #FF7A59, 0 0 12px #FF7A59, 0 6px 0 #0B0B18',
          WebkitTextStroke: '3px #0B0B18',
          paintOrder: 'stroke fill'
        }}
      >
        {correct ? 'CORRECT!' : 'OOPS!'}
      </motion.div>

      {message && (
        <motion.div
          className="mt-4 chip text-base"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {message}
        </motion.div>
      )}

      {correct && (
        <motion.div
          className="mt-8 font-display font-black text-6xl md:text-7xl text-lemon"
          style={{
            textShadow: '0 0 40px #FFE14A, 0 6px 0 #0B0B18',
            WebkitTextStroke: '3px #0B0B18',
            paintOrder: 'stroke fill'
          }}
          initial={{ y: 40, opacity: 0, scale: 0.3 }}
          animate={{
            y: [40, 0, 0, -6, 0],
            opacity: [0, 1, 1, 1, 1],
            scale: [0.3, 1.25, 1, 1.1, 1]
          }}
          transition={{ duration: 2.6, times: [0, 0.2, 0.45, 0.75, 1], delay: 0.25, ease: 'easeOut' }}
        >
          +{delta}
        </motion.div>
      )}

      {correct && <Burst x={50} y={50} count={36} />}
    </motion.div>
  )
}
