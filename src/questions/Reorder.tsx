import { motion, Reorder } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { ReorderQuestion } from '../data/quiz'
import { sfx } from '../sound'

export function ReorderQ({ q, onFinish }: { q: ReorderQuestion; onFinish: (correct: boolean) => void }) {
  const ids = useMemo(() => shuffle(q.items.map(i => i.id)), [q.id])
  const [order, setOrder] = useState<string[]>(ids)
  const [locked, setLocked] = useState(false)
  const [shake, setShake] = useState(false)

  function check() {
    if (locked) return
    const correct = [...q.items].sort((a, b) => a.order - b.order).map(i => i.id)
    const ok = order.every((id, i) => id === correct[i])
    if (ok) {
      sfx.correct()
      setLocked(true)
      setTimeout(() => onFinish(true), 800)
    } else {
      sfx.wrong()
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setLocked(true)
      setTimeout(() => onFinish(false), 800)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8">
      <motion.h2 className="title text-3xl md:text-5xl text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {q.prompt}
      </motion.h2>
      <div className="chip font-mono tracking-widest">{q.hint}</div>

      <motion.div animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} className="w-full max-w-5xl">
        <Reorder.Group
          axis="x"
          values={order}
          onReorder={setOrder}
          className="flex gap-5 justify-center"
        >
          {order.map((id, i) => {
            const item = q.items.find(x => x.id === id)!
            const correctPos = [...q.items].sort((a, b) => a.order - b.order).findIndex(it => it.id === id)
            const isCorrectHere = locked && correctPos === i
            const isWrongHere = locked && correctPos !== i
            return (
              <Reorder.Item
                key={id}
                value={id}
                dragListener={!locked}
                className="relative w-48 h-60 rounded-3xl border-4 border-ink bg-white text-ink shadow-pop flex flex-col items-center justify-center gap-3 cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 1.08, rotate: 3, zIndex: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                whileHover={!locked ? { y: -4 } : undefined}
                style={{
                  background: isCorrectHere ? '#59F3B1' : isWrongHere ? '#FF7A59' : 'white'
                }}
              >
                <motion.div
                  className="absolute top-2 left-2 w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-display font-bold text-lg"
                >
                  {i + 1}
                </motion.div>
                <div className="text-6xl">{item.icon}</div>
                <div className="font-display font-bold text-center px-3 text-xl leading-tight">{item.label}</div>
                <div className="text-xs font-mono text-ink/50 tracking-widest">DRAG</div>
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      </motion.div>

      <motion.button className="btn" onClick={check} disabled={locked} whileHover={!locked ? { scale: 1.04 } : undefined} whileTap={!locked ? { scale: 0.96 } : undefined}>
        {locked ? 'Locked' : 'Lock it in'}
      </motion.button>
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  if (a.length > 1 && a.every((v, i) => v === arr[i])) [a[0], a[1]] = [a[1], a[0]]
  return a
}
