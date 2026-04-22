import { motion } from 'framer-motion'
import { useState } from 'react'
import type { MCQQuestion } from '../data/quiz'
import { sfx } from '../sound'

const palette = ['#FF3DA8', '#21E6F0', '#FFE14A', '#59F3B1']
const shapes = ['▲', '●', '◆', '■']

export function MCQ({ q, onAnswer }: { q: MCQQuestion; onAnswer: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [wrongSet, setWrongSet] = useState<Set<string>>(new Set())

  function click(id: string, correct: boolean) {
    if (picked) return
    if (correct) {
      sfx.correct()
      setPicked(id)
      setTimeout(() => onAnswer(true), 600)
    } else {
      sfx.wrong()
      const next = new Set(wrongSet); next.add(id); setWrongSet(next)
      onAnswer(false)
      setPicked(id)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-12">
      <motion.h2
        className="title text-4xl md:text-6xl text-center max-w-4xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {q.prompt}
      </motion.h2>

      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {q.options.map((o, i) => {
          const isPicked = picked === o.id
          const isCorrect = o.correct
          const reveal = picked !== null
          return (
            <motion.button
              key={o.id}
              onClick={() => click(o.id, o.correct)}
              disabled={!!picked}
              initial={{ y: 40, opacity: 0, rotate: i % 2 === 0 ? -2 : 2 }}
              animate={{
                y: 0, opacity: 1, rotate: 0,
                scale: isPicked && isCorrect ? [1, 1.08, 1.04] : isPicked && !isCorrect ? [1, 0.94] : 1
              }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 18 }}
              whileHover={!picked ? { y: -4, rotate: i % 2 === 0 ? -1 : 1, scale: 1.03 } : undefined}
              whileTap={!picked ? { scale: 0.96 } : undefined}
              className="relative flex items-center gap-4 rounded-3xl p-6 font-display font-bold text-2xl md:text-3xl text-left text-ink shadow-pop border-4 border-ink overflow-hidden"
              style={{
                background: palette[i],
                opacity: reveal && !isCorrect && !isPicked ? 0.35 : 1,
                filter: reveal && !isCorrect && !isPicked ? 'grayscale(1)' : 'none'
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-ink text-white flex items-center justify-center text-3xl">
                {shapes[i]}
              </div>
              <span className="flex-1 leading-tight">{o.label}</span>

              {/* reveal flourish */}
              {reveal && isCorrect && (
                <motion.div
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-mint border-4 border-ink flex items-center justify-center text-ink text-2xl"
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                >
                  ✓
                </motion.div>
              )}
              {reveal && !isCorrect && isPicked && (
                <motion.div
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-coral border-4 border-ink flex items-center justify-center text-ink text-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                >
                  ✕
                </motion.div>
              )}

            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
