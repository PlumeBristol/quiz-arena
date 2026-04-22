import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { SwipeQuestion } from '../data/quiz'
import { sfx } from '../sound'

export function Swipe({ q, onFinish }: { q: SwipeQuestion; onFinish: (correct: number, total: number) => void }) {
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [flash, setFlash] = useState<'L' | 'R' | null>(null)
  const total = q.cards.length
  const remaining = q.cards.slice(i)

  function decide(side: 'left' | 'right') {
    const card = q.cards[i]
    if (!card) return
    const isRight = card.side === side
    if (isRight) { sfx.correct(); setCorrect(c => c + 1) } else sfx.wrong()
    setFlash(side === 'left' ? 'L' : 'R')
    setTimeout(() => setFlash(null), 250)
    const next = i + 1
    setI(next)
    if (next >= total) setTimeout(() => onFinish(isRight ? correct + 1 : correct, total), 380)
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8">
      <motion.h2 className="title text-3xl md:text-5xl text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {q.prompt}
      </motion.h2>

      <div className="flex items-center justify-center gap-10 w-full">
        {/* left bucket */}
        <Bucket label={q.left} color="#21E6F0" active={flash === 'L'} side="left" onTap={() => decide('left')} />

        <div className="relative w-[320px] h-[420px]">
          <AnimatePresence>
            {remaining.slice(0, 3).reverse().map((c, idx) => {
              const isTop = idx === Math.min(2, remaining.length - 1)
              const stackPos = remaining.length - 1 - idx
              return (
                <SwipeCard
                  key={c.id}
                  text={c.text}
                  stackIndex={stackPos}
                  isTop={isTop}
                  onDecide={decide}
                />
              )
            })}
          </AnimatePresence>
          {remaining.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-cyan text-2xl font-display font-bold">Done!</div>
          )}
        </div>

        <Bucket label={q.right} color="#FF3DA8" active={flash === 'R'} side="right" onTap={() => decide('right')} />
      </div>

      <div className="chip">Cards left: {total - i} · Correct: {correct}</div>
    </div>
  )
}

function Bucket({ label, color, active, side, onTap }: { label: string; color: string; active: boolean; side: 'left'|'right'; onTap: () => void }) {
  return (
    <motion.button
      onClick={onTap}
      className="rounded-[28px] border-4 border-ink px-6 py-10 font-display font-bold text-3xl text-ink shadow-pop"
      style={{ background: color }}
      animate={{ scale: active ? 1.15 : 1, rotate: side === 'left' ? [-2, 0] : [2, 0] }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-5xl">{side === 'left' ? '◀' : '▶'}</div>
        <div>{label}</div>
      </div>
    </motion.button>
  )
}

function SwipeCard({ text, stackIndex, isTop, onDecide }: { text: string; stackIndex: number; isTop: boolean; onDecide: (s: 'left'|'right') => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const leftGlow = useTransform(x, [-160, 0], [1, 0])
  const rightGlow = useTransform(x, [0, 160], [0, 1])

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl border-4 border-ink bg-white text-ink shadow-pop overflow-hidden"
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, zIndex: 10 - stackIndex }}
      initial={{ scale: 0.92 - stackIndex * 0.04, y: stackIndex * 10, opacity: 0 }}
      animate={{ scale: 1 - stackIndex * 0.04, y: stackIndex * 10, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (info.offset.x < -120) onDecide('left')
        else if (info.offset.x > 120) onDecide('right')
      }}
      whileTap={isTop ? { scale: 0.97 } : undefined}
    >
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-7xl">{emojiFor(text)}</div>
        <div className="font-display font-bold text-3xl text-center">{text}</div>
        {isTop && (
          <div className="text-sm text-ink/60 font-mono tracking-widest mt-2">DRAG OR TAP A SIDE</div>
        )}
      </div>
      {isTop && (
        <>
          <motion.div className="absolute top-4 left-4 rounded-xl border-4 border-cyan text-cyan font-display font-bold text-2xl px-3 py-1 rotate-[-14deg]" style={{ opacity: leftGlow }}>←</motion.div>
          <motion.div className="absolute top-4 right-4 rounded-xl border-4 border-magenta text-magenta font-display font-bold text-2xl px-3 py-1 rotate-[14deg]" style={{ opacity: rightGlow }}>→</motion.div>
        </>
      )}
    </motion.div>
  )
}

function emojiFor(name: string): string {
  const m: Record<string, string> = {
    Dolphin: '🐬', Crocodile: '🐊', Kangaroo: '🦘', Gecko: '🦎',
    Bat: '🦇', Tortoise: '🐢', Whale: '🐳', Iguana: '🦎'
  }
  return m[name] ?? '🐾'
}
