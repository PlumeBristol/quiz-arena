import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { sfx } from '../sound'

export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState<number | 'GO' | 'WAIT'>('WAIT')
  // Keep onDone in a ref so re-renders of the parent (which pass a fresh inline
  // arrow) don't retrigger the timer effect and cancel the countdown mid-flight.
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const seq: (number | 'GO')[] = [3, 2, 1, 'GO']
    let i = 0
    setN(seq[0])
    sfx.countdown()
    const id = setInterval(() => {
      i++
      if (i >= seq.length) {
        clearInterval(id)
        setTimeout(() => doneRef.current(), 500)
        return
      }
      setN(seq[i])
      if (seq[i] === 'GO') sfx.go(); else sfx.countdown()
    }, 700)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <motion.div
        className="font-mono tracking-[0.4em] text-cyan text-lg uppercase"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Get ready…
      </motion.div>

      <div className="relative h-48 flex items-center justify-center">
        <AnimatePresence>
          {n !== 'WAIT' && (
            <motion.div
              key={String(n)}
              className={`absolute font-display font-bold text-[180px] leading-none ${n === 'GO' ? 'text-mint' : 'text-lemon'}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ textShadow: n === 'GO' ? '0 0 40px #59F3B1' : '0 0 40px #FFE14A' }}
            >
              {n}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
