import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import type { SliderQuestion } from '../data/quiz'
import { sfx } from '../sound'

/**
 * Slider: drag a knob along a horizontal track to pick a number.
 * Answer is correct if |value - target| ≤ tolerance.
 */
export function Slider({ q, onFinish }: { q: SliderQuestion; onFinish: (correct: boolean) => void }) {
  const TRACK_W = 640
  const KNOB = 56
  const START_FRAC = 0.5
  const [locked, setLocked] = useState(false)
  const [shake, setShake] = useState(false)
  const x = useMotionValue(TRACK_W * START_FRAC - KNOB / 2)
  const value = useTransform(x, (px) => {
    const frac = (px + KNOB / 2) / TRACK_W
    return q.min + frac * (q.max - q.min)
  })
  const [display, setDisplay] = useState(formatValue(q, q.min + START_FRAC * (q.max - q.min)))

  // live-update display as the user drags
  value.on('change', (v) => setDisplay(formatValue(q, v)))

  function submit() {
    if (locked) return
    const v = Math.round(value.get())
    const ok = Math.abs(v - q.target) <= q.tolerance
    if (ok) {
      sfx.correct()
      setLocked(true)
      setTimeout(() => onFinish(true), 800)
    } else {
      sfx.wrong()
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setLocked(true)
      setTimeout(() => onFinish(false), 900)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8">
      <motion.h2 className="title text-3xl md:text-5xl text-center max-w-3xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {q.prompt}
      </motion.h2>

      {/* Big live-value readout */}
      <motion.div
        className="font-display font-black text-7xl md:text-8xl text-lemon"
        style={{
          textShadow: '0 0 40px #FFE14A, 0 5px 0 #0B0B18',
          WebkitTextStroke: '3px #0B0B18',
          paintOrder: 'stroke fill'
        }}
        animate={shake ? { x: [0, -14, 14, -6, 6, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {display}
      </motion.div>

      {/* Track */}
      <div className="relative" style={{ width: TRACK_W }}>
        {/* Tick marks */}
        <div className="flex justify-between text-white/40 font-mono text-sm mb-2">
          <span>{formatValue(q, q.min)}</span>
          <span>{formatValue(q, (q.min + q.max) / 2)}</span>
          <span>{formatValue(q, q.max)}</span>
        </div>
        <div className="relative h-4 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden">
          {/* gradient fill up to knob */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan via-magenta to-lemon"
            style={{ width: useTransform(x, (px) => `${((px + KNOB / 2) / TRACK_W) * 100}%`) }}
          />
          {/* Tolerance band — only after locked */}
          {locked && (
            <motion.div
              className="absolute inset-y-0 bg-mint/60 border-x-2 border-mint"
              style={{
                left: `${((q.target - q.tolerance - q.min) / (q.max - q.min)) * 100}%`,
                width: `${((q.tolerance * 2) / (q.max - q.min)) * 100}%`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </div>
        {/* Knob */}
        <motion.div
          className="absolute -top-5 w-14 h-14 rounded-full bg-white border-4 border-ink shadow-pop cursor-grab active:cursor-grabbing flex items-center justify-center text-ink font-display font-bold text-xl"
          drag={locked ? false : 'x'}
          dragConstraints={{ left: -KNOB / 2, right: TRACK_W - KNOB / 2 }}
          dragElastic={0}
          dragMomentum={false}
          style={{ x }}
          whileDrag={{ scale: 1.12 }}
        >
          ◆
        </motion.div>
        {/* Target reveal marker — after locked */}
        {locked && (
          <motion.div
            className="absolute -bottom-8 -translate-x-1/2 font-display font-bold text-mint"
            style={{ left: `${((q.target - q.min) / (q.max - q.min)) * 100}%` }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ▲ {formatValue(q, q.target)}
          </motion.div>
        )}
      </div>

      {/* Lock-in button */}
      <motion.button
        className="btn mt-8"
        onClick={submit}
        disabled={locked}
        whileHover={!locked ? { scale: 1.05 } : undefined}
        whileTap={!locked ? { scale: 0.96 } : undefined}
      >
        {locked ? '…' : 'Lock in'}
      </motion.button>
    </div>
  )
}

function formatValue(q: SliderQuestion, v: number): string {
  const rounded = Math.round(v)
  if (q.format === 'year') return String(rounded)
  return `${rounded}${q.unit ? ' ' + q.unit : ''}`
}
