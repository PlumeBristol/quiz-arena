import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../store'
import { quiz } from '../data/quiz'

const ICONS: Record<string, string> = {
  mcq: '●', swipe: '↔', drag: '✥', reorder: '≡', aim: '⊹', rhythm: '♪',
  slider: '━', pinch: '⤢', hotcold: '◎'
}

/**
 * Debug overlay — lets you skip to any question. Toggle with `~` or the small button.
 * Only mounted in dev builds.
 */
export function DebugBar() {
  const [open, setOpen] = useState(false)
  const phase = useGame(s => s.phase)
  const index = useGame(s => s.index)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault()
        setOpen(o => !o)
        return
      }
      if (!e.shiftKey) return
      if (e.key === '>' || e.key === '.') {
        e.preventDefault()
        jumpTo(Math.min(quiz.length - 1, index + 1))
      } else if (e.key === '<' || e.key === ',') {
        e.preventDefault()
        jumpTo(Math.max(0, index - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])

  function jumpTo(i: number) {
    const q = quiz[i]
    useGame.setState({
      phase: 'playing',
      index: i,
      timeLeft: q.time,
      answered: false,
      correct: false,
      playerDelta: 0,
      paused: false
    })
  }

  function goPodium() {
    // Apply random-ish final scores so the podium/leaderboard looks real.
    useGame.setState(s => {
      const scored = s.scores.map(sc => ({
        ...sc,
        score: sc.score + Math.floor(400 + Math.random() * 3600),
        lastDelta: 0
      })).sort((a, b) => b.score - a.score)
      return { scores: scored, phase: 'podium' }
    })
  }

  function goLeaderboard() {
    useGame.setState(s => {
      const scored = s.scores.map(sc => ({
        ...sc,
        score: sc.score + Math.floor(400 + Math.random() * 3600),
        lastDelta: Math.floor(300 + Math.random() * 700)
      })).sort((a, b) => b.score - a.score)
      return { scores: scored, phase: 'leaderboard' }
    })
  }

  return (
    <>
      {/* Small floating toggle pill, always visible in the bottom-left corner */}
      <button
        className="fixed bottom-3 left-3 z-[100] font-mono text-[10px] tracking-widest bg-ink/80 text-white border border-white/20 rounded-full px-2.5 py-1 hover:bg-ink"
        onClick={() => setOpen(o => !o)}
        title="Debug menu (`)"
      >
        {open ? '× CLOSE' : 'DEBUG'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-12 left-3 z-[100] bg-ink/95 border border-white/15 rounded-xl shadow-pop font-mono text-xs text-white p-3 w-[260px] backdrop-blur"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lemon font-bold tracking-widest">DEBUG · {phase.toUpperCase()}</span>
              <span className="text-white/40">` toggle · Shift+, / .</span>
            </div>
            <div className="flex flex-col gap-1">
              {quiz.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => jumpTo(i)}
                  className={`text-left px-2 py-1.5 rounded border transition flex items-center gap-2
                    ${i === index ? 'bg-lemon/15 border-lemon text-lemon' : 'border-white/10 hover:bg-white/5 text-white/80'}`}
                >
                  <span className="w-6 text-center">{i + 1}</span>
                  <span className="w-5 text-center">{ICONS[q.type] ?? '?'}</span>
                  <span className="flex-1 truncate">{q.type} — {q.prompt}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 flex gap-2">
              <button className="flex-1 px-2 py-1.5 rounded border border-white/10 hover:bg-white/5" onClick={goLeaderboard}>
                → Leaderboard
              </button>
              <button className="flex-1 px-2 py-1.5 rounded border border-white/10 hover:bg-white/5" onClick={goPodium}>
                → Podium
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10">
              <button className="w-full px-2 py-1.5 rounded border border-white/10 hover:bg-white/5 text-white/60" onClick={() => useGame.getState().reset()}>
                Reset to splash
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
