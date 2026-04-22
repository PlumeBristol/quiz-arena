import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Score } from '../store'
import { sfx } from '../sound'

type Props = {
  scores: Score[]
  round: number
  totalRounds: number
  onContinue: () => void
}

export function Leaderboard({ scores, round, totalRounds, onContinue }: Props) {
  const top5 = scores.slice(0, 5)
  // If the player isn't in the top 5, render them separately at the bottom.
  const you = scores.find(s => s.isYou)!
  const youInTop = top5.some(s => s.isYou)

  const [revealIdx, setRevealIdx] = useState(0)

  // Reveal rows from bottom of top-5 upward for drama.
  useEffect(() => {
    setRevealIdx(0)
    const order = top5.length - 1
    let i = 0
    const tick = () => {
      sfx.climb(order - i)
      setRevealIdx(v => v + 1)
      i++
      if (i <= order) {
        setTimeout(tick, 280)
      } else {
        setTimeout(() => sfx.pop(), 250)
      }
    }
    const start = setTimeout(tick, 400)
    return () => clearTimeout(start)
  }, [scores])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8">
      <motion.div className="chip text-cyan" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Leaderboard · Round {round} of {totalRounds}
      </motion.div>

      <motion.h2
        className="title text-5xl md:text-6xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ backgroundImage: 'linear-gradient(180deg, #FFE14A 0%, #FF7A59 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
      >
        STANDINGS
      </motion.h2>

      <div className="w-full max-w-3xl flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {top5.map((s, i) => {
            const revealed = i >= top5.length - revealIdx
            return (
              <motion.div
                key={s.id}
                layout
                className={`relative flex items-center gap-4 rounded-3xl px-5 py-4 border-2 overflow-hidden
                  ${s.isYou ? 'bg-lemon/10 border-lemon' : 'bg-white/5 border-white/10'}`}
                initial={{ opacity: 0, x: -60, scale: 0.92 }}
                animate={revealed ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -60, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, layout: { type: 'spring', stiffness: 280, damping: 26 } }}
              >
                {/* Rank */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-3xl
                  ${i === 0 ? 'bg-lemon text-ink' : i === 1 ? 'bg-cyan text-ink' : i === 2 ? 'bg-coral text-ink' : 'bg-white/10 text-white'}`}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border-2 border-white/20"
                  style={{ background: s.color + '33' }}
                >
                  {s.emoji}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <div className="font-display font-bold text-2xl">{s.name}{s.isYou && <span className="ml-2 text-xs uppercase tracking-widest text-lemon">you</span>}</div>
                  {s.lastDelta > 0 && (
                    <div className="font-mono text-mint text-sm">+{s.lastDelta}</div>
                  )}
                  {s.lastDelta === 0 && s.isYou && (
                    <div className="font-mono text-coral text-sm">+0</div>
                  )}
                </div>

                {/* Score */}
                <div className="font-mono font-bold text-3xl tabular-nums">
                  <ScoreCounter from={s.score - s.lastDelta} to={s.score} delay={0.3 + i * 0.05} />
                </div>

                {/* glow for top 3 */}
                {i < 3 && (
                  <motion.div
                    className="absolute -inset-px rounded-3xl pointer-events-none"
                    style={{ boxShadow: `inset 0 0 40px ${i === 0 ? '#FFE14A' : i === 1 ? '#21E6F0' : '#FF7A59'}` }}
                    initial={{ opacity: 0 }}
                    animate={revealed ? { opacity: 0.4 } : { opacity: 0 }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Show player separately if not in top 5 */}
        {!youInTop && (
          <motion.div
            layout
            className="relative flex items-center gap-4 rounded-3xl px-5 py-4 border-2 bg-lemon/10 border-lemon mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-2xl bg-white/10">
              {scores.findIndex(s => s.isYou) + 1}
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border-2 border-white/20" style={{ background: you.color + '33' }}>
              {you.emoji}
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-2xl">You</div>
              <div className="font-mono text-sm text-white/70">Keep going!</div>
            </div>
            <div className="font-mono font-bold text-3xl tabular-nums"><ScoreCounter from={you.score - you.lastDelta} to={you.score} delay={0.7} /></div>
          </motion.div>
        )}
      </div>

      <motion.button
        className="btn"
        onClick={() => { sfx.pop(); onContinue() }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        {round >= totalRounds ? 'See results →' : 'Next round →'}
      </motion.button>
    </div>
  )
}

function ScoreCounter({ from, to, delay = 0 }: { from: number; to: number; delay?: number }) {
  const [v, setV] = useState(from)
  useEffect(() => {
    const start = performance.now() + delay * 1000
    const dur = 700
    let raf = 0
    const step = (t: number) => {
      if (t < start) { raf = requestAnimationFrame(step); return }
      const k = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setV(Math.round(from + (to - from) * eased))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [from, to, delay])
  return <>{v.toLocaleString()}</>
}
