import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useGame } from './store'
import { sfx, setMuted } from './sound'
import { Splash } from './components/Splash'
import { Countdown } from './components/Countdown'
import { Leaderboard } from './components/Leaderboard'
import { Podium } from './components/Podium'
import { Reveal } from './components/Reveal'
import { Timer } from './components/Timer'
import { BackgroundOrbs, type BgTheme } from './components/Particles'
import { DebugBar } from './components/DebugBar'
import { ErrorBoundary } from './components/ErrorBoundary'
import { MCQ } from './questions/MCQ'
import { Swipe } from './questions/Swipe'
import { Drag } from './questions/Drag'
import { ReorderQ } from './questions/Reorder'
import { Aim } from './questions/Aim'
import { Rhythm } from './questions/Rhythm'
import { Slider } from './questions/Slider'
import { Pinch } from './questions/Pinch'
import { HotCold } from './questions/HotCold'

export default function App() {
  const phase = useGame(s => s.phase)
  const index = useGame(s => s.index)
  const total = useGame(s => s.total())
  const begin = useGame(s => s.begin)
  const setPhase = useGame(s => s.setPhase)
  const submitAnswer = useGame(s => s.submitAnswer)
  const advance = useGame(s => s.advance)
  const reset = useGame(s => s.reset)
  const scores = useGame(s => s.scores)
  const timeLeft = useGame(s => s.timeLeft)
  const answered = useGame(s => s.answered)
  const correct = useGame(s => s.correct)
  const playerDelta = useGame(s => s.playerDelta)
  const current = useGame(s => s.current())
  const tickTime = useGame(s => s.tickTime)
  const paused = useGame(s => s.paused)

  // Tick timer while playing (unless the active question has paused it, e.g. tutorial)
  useEffect(() => {
    if (phase !== 'playing' || paused) return
    let last = performance.now()
    const id = setInterval(() => {
      if (useGame.getState().paused) { last = performance.now(); return }
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      const left = useGame.getState().timeLeft - dt
      if (left <= 0) {
        tickTime(0)
        if (!useGame.getState().answered) {
          submitAnswer(false, { speedFactor: 0 })
          setTimeout(() => setPhase('reveal'), 400)
        }
        clearInterval(id)
      } else {
        tickTime(left)
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase, index, paused, submitAnswer, setPhase, tickTime])

  useEffect(() => { setMuted(false) }, [])

  const roundType: Record<string, string> = {
    mcq: 'Tap the answer', swipe: 'Swipe to sort', drag: 'Drag the labels',
    reorder: 'Put in order', aim: 'Aim and fire', rhythm: 'Tap on beat'
  }

  return (
    <div className="stage noise">
      <BackgroundOrbs theme={currentTheme(phase, current?.id)} />
      <DebugBar />

      <div className="absolute inset-0 z-10">
        {/*
          NB: no mode="wait" — that previously caused the Q3→Q4 transition to hang
          because the exiting "play-q3" motion.div sometimes never finalised and the
          "play-q4" child was held back from mounting. Letting them overlap briefly
          (~0.35s of cross-fade) is more robust.
        */}
        <AnimatePresence>
          {phase === 'splash' && (
            <motion.div
              key="splash"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <Splash onStart={begin} />
            </motion.div>
          )}

          {phase === 'countdown' && (
            <motion.div
              key={`countdown-${current.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Countdown onDone={() => setPhase('playing')} />
            </motion.div>
          )}

          {(phase === 'playing' || phase === 'reveal') && (
            <motion.div
              key={`play-${current.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              {/* HUD */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <div className="chip text-cyan">Round {index + 1} / {total} · {roundType[current.type]}</div>
                <Timer timeLeft={timeLeft} total={current.time} />
              </div>

              {/* Question body — wrapped in an error boundary so a render
                  failure doesn't silently bail to a blank screen. */}
              <ErrorBoundary label={`Q${index + 1} (${current.type}) render error`}>
              {current.type === 'mcq' && (
                <MCQ q={current} onAnswer={(ok) => {
                  submitAnswer(ok)
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'swipe' && (
                <Swipe q={current} onFinish={(c, t) => {
                  const ok = c >= Math.ceil(t * 0.75)
                  submitAnswer(ok, { speedFactor: c / t })
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'drag' && (
                <Drag q={current} onFinish={(c, t) => {
                  const ok = c === t
                  submitAnswer(ok, { speedFactor: c / t })
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'reorder' && (
                <ReorderQ q={current} onFinish={(ok) => {
                  submitAnswer(ok)
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'aim' && (
                <Aim q={current} onFinish={(ok) => {
                  submitAnswer(ok)
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'rhythm' && (
                <Rhythm q={current} onFinish={(c, t) => {
                  const ok = c >= Math.ceil(t * 0.6)
                  submitAnswer(ok, { speedFactor: c / t })
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'slider' && (
                <Slider q={current} onFinish={(ok) => {
                  submitAnswer(ok)
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'pinch' && (
                <Pinch q={current} onFinish={(ok) => {
                  submitAnswer(ok)
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              {current.type === 'hotcold' && (
                <HotCold q={current} onFinish={(ok) => {
                  submitAnswer(ok)
                  setTimeout(() => setPhase('reveal'), 500)
                }} />
              )}
              </ErrorBoundary>

              {/* Reveal overlay */}
              {phase === 'reveal' && (
                <Reveal
                  correct={correct}
                  delta={playerDelta}
                  message={!correct ? revealLabel(current) : undefined}
                  onDone={() => advance()}
                />
              )}
            </motion.div>
          )}

          {phase === 'leaderboard' && (
            <motion.div
              key={`lb-${index}`}
              className="absolute inset-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <Leaderboard
                scores={scores}
                round={index + 1}
                totalRounds={total}
                onContinue={() => { sfx.whoosh(); advance() }}
              />
            </motion.div>
          )}

          {phase === 'podium' && (
            <motion.div
              key="podium"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Podium scores={scores} onRestart={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Maps each phase/question to a background theme so the backdrop matches the mood.
// Every question gets its own unique theme — no repeats across the 8 rounds.
const THEME_BY_QID: Record<string, BgTheme> = {
  q1: 'space',    // planet MCQ
  q2: 'neon',     // rhythm: multiples of 9
  q3: 'lava',     // volcano drag
  q4: 'ancient',  // history reorder
  q5: 'lunar',    // moon landing slider
  q6: 'desert',   // elephant pinch
  q7: 'ocean',    // find Australia hot/cold
  q8: 'jungle'    // mammal/reptile swipe
}
function currentTheme(phase: string, qid?: string): BgTheme {
  if (phase === 'podium') return 'space'
  if (phase === 'leaderboard') return 'neon'
  if (qid && THEME_BY_QID[qid]) return THEME_BY_QID[qid]
  return 'space'
}

function revealLabel(q: any): string {
  if (q.type === 'mcq') {
    const c = q.options.find((o: any) => o.correct)
    return `Answer: ${c?.label ?? '?'}`
  }
  if (q.type === 'aim') {
    const c = q.targets.find((t: any) => t.correct)
    return `Answer: ${c?.label ?? '?'}`
  }
  if (q.type === 'slider') {
    return `Answer: ${q.target}${q.unit ? ' ' + q.unit : ''}`
  }
  if (q.type === 'pinch') {
    return `Answer: ${q.realSize} ${q.unit}`
  }
  return ''
}
