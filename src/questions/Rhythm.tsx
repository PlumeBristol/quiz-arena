import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { RhythmQuestion } from '../data/quiz'
import { sfx } from '../sound'
import { useGame } from '../store'

/**
 * Rhythm tap: tokens fall on 3 lanes. A hit line sits near the bottom.
 * Press the lane (keys A/S/D or tap buttons) when a CORRECT token is close to the hit line.
 * Wrong tokens should be left alone. Missing a correct token or tapping a wrong one costs points.
 *
 * Tutorial: before the round starts, the first correct token is frozen at the hit line and
 * the matching lane is highlighted. The game timer is paused until the player taps it once.
 */
const HEIGHT = 560
const FALL_DURATION = 2.6 // seconds for a token to fall from top to hit line
const LANE_LABELS = ['A', 'S', 'D']
const HIT_Y = HEIGHT - 160 // y-coord of the hit line (centre of target + centre of landing token)
const TAPBAR_H = 90
const TOKEN_SIZE = 72
const TARGET_SIZE = 88 // slightly larger so landing token sits inside
// Mixed palette so players must judge by the NUMBER not the colour.
const TOKEN_PALETTE = ['#21E6F0', '#FF3DA8', '#FFE14A', '#59F3B1', '#FF7A59', '#7B2CFF']
function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return TOKEN_PALETTE[h % TOKEN_PALETTE.length]
}

export function Rhythm({ q, onFinish }: { q: RhythmQuestion; onFinish: (correct: number, total: number) => void }) {
  const setPaused = useGame(s => s.setPaused)

  const firstCorrect = q.tokens.find(t => t.correct)!
  const [mode, setMode] = useState<'tutorial' | 'running' | 'done'>('tutorial')
  const [tutorialLanded, setTutorialLanded] = useState(false)
  const [t0, setT0] = useState(0)
  const [now, setNow] = useState(0)
  const [tokenState, setTokenState] = useState<Record<string, 'pending' | 'hit' | 'missed' | 'wrongTap'>>({})
  const [laneFlash, setLaneFlash] = useState<Record<number, number>>({})
  const [flourishes, setFlourishes] = useState<Array<{ key: number; x: number; label: string; color: string; kind: 'hit' | 'fail' | 'pass' }>>([])
  const finishedRef = useRef(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const missedRef = useRef<Set<string>>(new Set())
  const passedRef = useRef<Set<string>>(new Set())

  function addFlourish(laneIdx: number, label: string, color: string, kind: 'hit' | 'fail' | 'pass' = 'hit') {
    const laneW = 660 / 3
    const x = laneIdx * laneW + laneW / 2
    const key = performance.now() + Math.random()
    setFlourishes(f => [...f, { key, x, label, color, kind }])
    setTimeout(() => setFlourishes(f => f.filter(fl => fl.key !== key)), 1000)
  }

  // Auto-focus the stage so A/S/D keys register even before the user clicks in.
  useEffect(() => {
    stageRef.current?.focus()
  }, [])

  // Pause the game timer while the tutorial is up.
  useEffect(() => {
    setPaused(mode === 'tutorial')
    return () => setPaused(false)
  }, [mode, setPaused])

  // Clock for falling tokens — only runs while in 'running' mode
  useEffect(() => {
    if (mode !== 'running') return
    let raf = 0
    const tick = (t: number) => {
      setNow((t - t0) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, t0])

  // Keyboard support — listen on window so taps work without clicking into the page first.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, number> = { a: 0, s: 1, d: 2, ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2 }
      const l = map[e.key]
      if (l !== undefined) {
        e.preventDefault()
        tapLane(l)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, mode, tutorialLanded])

  // Line-crossing bookkeeping:
  //  - Correct token untapped → 'missed' + fail flourish + wrong sfx
  //  - Wrong token untapped   → 'passed' + tiny ✓ flourish + soft sfx (rewards correct avoidance)
  useEffect(() => {
    if (mode !== 'running' || finishedRef.current) return
    for (const tok of q.tokens) {
      if (tokenState[tok.id]) continue
      const elapsed = now - (tok.t - FALL_DURATION)
      if (elapsed <= FALL_DURATION + 0.15) continue
      if (tok.correct) {
        if (missedRef.current.has(tok.id)) continue
        missedRef.current.add(tok.id)
        setTokenState(s => ({ ...s, [tok.id]: 'missed' }))
        addFlourish(tok.lane, tok.label, colorFor(tok.id), 'fail')
        sfx.wrong()
      } else {
        if (passedRef.current.has(tok.id)) continue
        passedRef.current.add(tok.id)
        setTokenState(s => ({ ...s, [tok.id]: 'missed' })) // mark as gone so it disappears from the fall stack
        addFlourish(tok.lane, tok.label, colorFor(tok.id), 'pass')
        sfx.hover()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, mode])

  // End-of-round: once the last token has passed, finalise
  useEffect(() => {
    if (finishedRef.current || mode !== 'running') return
    const lastHit = Math.max(...q.tokens.map(t => t.t))
    if (now > lastHit + 1.2) {
      finishedRef.current = true
      setTokenState(prev => {
        const next = { ...prev }
        for (const tok of q.tokens) {
          if (!next[tok.id] && tok.correct) next[tok.id] = 'missed'
        }
        return next
      })
      const totalCorrect = q.tokens.filter(t => t.correct).length
      setTimeout(() => {
        const hits = Object.entries(tokenState).filter(([id, s]) => s === 'hit' && q.tokens.find(t => t.id === id)?.correct).length
        onFinish(hits, totalCorrect)
      }, 500)
    }
  }, [now, q.tokens, onFinish, tokenState, mode])

  function startRound() {
    setT0(performance.now())
    setMode('running')
  }

  function tapLane(lane: number) {
    setLaneFlash(f => ({ ...f, [lane]: performance.now() + 180 }))

    if (mode === 'tutorial') {
      if (!tutorialLanded) return
      if (lane === firstCorrect.lane) {
        sfx.correct()
        addFlourish(firstCorrect.lane, firstCorrect.label, colorFor(firstCorrect.id))
        setTokenState(s => ({ ...s, [firstCorrect.id]: 'hit' }))
        setTimeout(startRound, 650)
      } else {
        sfx.wrong()
      }
      return
    }

    if (mode !== 'running' || finishedRef.current) return

    const hitWindow = 0.32
    const candidate = q.tokens.find(tok => tok.lane === lane && !tokenState[tok.id] && Math.abs(tok.t - now) < hitWindow)
    if (candidate) {
      if (candidate.correct) {
        sfx.pop()
        addFlourish(candidate.lane, candidate.label, colorFor(candidate.id), 'hit')
        setTokenState(s => ({ ...s, [candidate.id]: 'hit' }))
      } else {
        sfx.wrong()
        addFlourish(candidate.lane, candidate.label, colorFor(candidate.id), 'fail')
        setTokenState(s => ({ ...s, [candidate.id]: 'wrongTap' }))
      }
    } else {
      sfx.tap()
    }
  }

  const showTutorialTip = mode === 'tutorial' && tutorialLanded
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
      <motion.h2 className="title text-3xl md:text-5xl text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {q.prompt}
      </motion.h2>
      {/* Fixed-height slot so the tutorial tooltip doesn't push the stage down */}
      <div className="relative h-12 flex items-center justify-center">
        <div className="chip font-mono tracking-widest text-mint">A · S · D or tap lanes</div>
        <AnimatePresence>
          {showTutorialTip && (
            <motion.div
              key="tutoriptip"
              className="absolute bg-white text-ink font-display font-bold rounded-2xl px-5 py-2.5 border-4 border-ink text-lg text-center shadow-pop whitespace-nowrap"
              initial={{ y: -10, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            >
              Try it! Press <span className="bg-ink text-lemon font-black px-2 rounded mx-1">{LANE_LABELS[firstCorrect.lane]}</span>
              to catch the multiple of 9
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        ref={stageRef}
        tabIndex={0}
        className="relative rounded-3xl border-4 border-ink overflow-hidden shadow-pop outline-none focus:ring-2 focus:ring-lemon/40"
        style={{ width: 660, height: HEIGHT, background: 'linear-gradient(180deg,#141028 0%, #2D1F3A 100%)' }}
      >
        {/* Lane dividers */}
        {[1, 2].map(i => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${(i / 3) * 100}%` }} />
        ))}

        {/* Hit line — the gradient bar sits at HIT_Y and the square targets centre on it. */}
        <div
          className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-cyan via-magenta to-lemon"
          style={{ top: HIT_Y - 0.75, boxShadow: '0 0 24px #FF3DA8' }}
        />
        {[0, 1, 2].map(l => {
          const flashUntil = laneFlash[l] ?? 0
          const isFlashing = performance.now() < flashUntil
          const highlightInTutorial = mode === 'tutorial' && l === firstCorrect.lane
          const laneW = 660 / 3
          const cx = l * laneW + laneW / 2
          return (
            <motion.div
              key={l}
              className="absolute rounded-2xl border-4 border-dashed"
              style={{
                left: cx - TARGET_SIZE / 2,
                top: HIT_Y - TARGET_SIZE / 2,
                width: TARGET_SIZE,
                height: TARGET_SIZE,
                boxShadow: highlightInTutorial ? '0 0 28px #FFE14A' : undefined,
                borderColor: highlightInTutorial ? '#FFE14A' : (isFlashing ? '#FFE14A' : 'rgba(255,255,255,0.45)')
              }}
              animate={{
                scale: highlightInTutorial ? [1, 1.1, 1] : (isFlashing ? [1, 1.25, 1] : 1)
              }}
              transition={{ duration: highlightInTutorial ? 1.1 : 0.3, repeat: highlightInTutorial ? Infinity : 0 }}
            />
          )
        })}

        {/* Tutorial: the first correct token falls from the top, lands on the hit line, then pauses. */}
        {mode === 'tutorial' && (() => {
          const laneW = 660 / 3
          const laneX = firstCorrect.lane * laneW + laneW / 2
          return (
            <>
              <motion.div
                className="absolute rounded-2xl border-4 border-ink font-display font-bold text-2xl flex items-center justify-center"
                style={{
                  left: laneX - TOKEN_SIZE / 2,
                  top: -TOKEN_SIZE / 2,
                  width: TOKEN_SIZE, height: TOKEN_SIZE,
                  background: colorFor(firstCorrect.id),
                  color: '#0B0B18',
                  boxShadow: tutorialLanded ? '0 0 36px #FFE14A' : '0 0 16px rgba(255,255,255,0.25)'
                }}
                initial={{ y: 0 }}
                animate={
                  tutorialLanded
                    ? { y: [HIT_Y, HIT_Y - 8, HIT_Y] }
                    : { y: HIT_Y }
                }
                transition={
                  tutorialLanded
                    ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 2, ease: [0.4, 0.0, 0.3, 1] }
                }
                onAnimationComplete={() => { if (!tutorialLanded) { sfx.pop(); setTutorialLanded(true) } }}
              >
                {firstCorrect.label}
              </motion.div>

              {/* Arrow only appears once the token has landed */}
              <AnimatePresence>
                {tutorialLanded && (
                  <motion.div
                    key="arrow"
                    className="absolute text-5xl"
                    style={{ left: laneX, bottom: 4, transform: 'translateX(-50%)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: [0, -8, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ y: { duration: 0.9, repeat: Infinity }, opacity: { duration: 0.2 } }}
                  >
                    👆
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )
        })()}

        {/* Falling tokens (only while running) */}
        {mode === 'running' && q.tokens.map(tok => {
          if (tok.id === firstCorrect.id) return null
          const elapsed = now - (tok.t - FALL_DURATION)
          if (elapsed < 0 || elapsed > FALL_DURATION + 0.5) return null
          const progress = Math.min(1.05, elapsed / FALL_DURATION)
          const laneW = 660 / 3
          const cx = tok.lane * laneW + laneW / 2
          const y = -TOKEN_SIZE + progress * (HIT_Y + TOKEN_SIZE)
          const state = tokenState[tok.id]
          if (state === 'hit' || state === 'wrongTap' || state === 'missed') return null
          return (
            <motion.div
              key={tok.id}
              className="absolute rounded-2xl border-4 border-ink font-display font-bold text-2xl flex items-center justify-center"
              style={{
                left: cx - TOKEN_SIZE / 2,
                top: y - TOKEN_SIZE / 2,
                width: TOKEN_SIZE, height: TOKEN_SIZE,
                background: colorFor(tok.id),
                color: '#0B0B18'
              }}
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {tok.label}
            </motion.div>
          )
        })}

        {/* Celebration flourishes — correct hits spin+burst, misses/wrong taps shake+crumble */}
        <AnimatePresence>
          {flourishes.map(fl => fl.kind === 'hit' ? (
            <motion.div
              key={fl.key}
              className="absolute pointer-events-none"
              style={{ left: fl.x, top: HIT_Y, transform: 'translate(-50%, -50%)' }}
            >
              <motion.div
                className="rounded-2xl border-4 border-ink font-display font-black text-2xl flex items-center justify-center"
                style={{ width: TOKEN_SIZE, height: TOKEN_SIZE, background: fl.color, color: '#0B0B18', boxShadow: `0 0 32px ${fl.color}` }}
                initial={{ scale: 1, rotate: 0, opacity: 1 }}
                animate={{ scale: [1, 1.6, 2.2], rotate: [0, 180, 360], opacity: [1, 1, 0] }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                {fl.label}
              </motion.div>
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 font-display font-black text-3xl text-lemon whitespace-nowrap"
                style={{ top: -12, textShadow: '0 0 12px #FFE14A, 0 3px 0 #0B0B18', WebkitTextStroke: '2px #0B0B18', paintOrder: 'stroke fill' }}
                initial={{ y: 0, opacity: 0, scale: 0.6 }}
                animate={{ y: -80, opacity: [0, 1, 1, 0], scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                +100
              </motion.div>
              {Array.from({ length: 10 }).map((_, i) => {
                const a = (Math.PI * 2 * i) / 10
                return (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full"
                    style={{ background: fl.color, boxShadow: `0 0 6px ${fl.color}` }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                    animate={{ x: Math.cos(a) * 90, y: Math.sin(a) * 90, opacity: 0, scale: 0.2 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                )
              })}
            </motion.div>
          ) : fl.kind === 'pass' ? (
            <motion.div
              key={fl.key}
              className="absolute pointer-events-none font-display font-black text-mint text-4xl"
              style={{ left: fl.x, top: HIT_Y, transform: 'translate(-50%, -50%)', textShadow: '0 0 16px #59F3B1', WebkitTextStroke: '2px #0B0B18', paintOrder: 'stroke fill' }}
              initial={{ scale: 0.5, opacity: 0, y: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0], y: [0, -28, -48] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              ✓
            </motion.div>
          ) : (
            <motion.div
              key={fl.key}
              className="absolute pointer-events-none"
              style={{ left: fl.x, top: HIT_Y, transform: 'translate(-50%, -50%)' }}
            >
              {/* shaking grayed number that crumbles */}
              <motion.div
                className="relative rounded-2xl border-4 border-ink font-display font-black text-2xl flex items-center justify-center grayscale"
                style={{ width: TOKEN_SIZE, height: TOKEN_SIZE, background: fl.color, color: '#0B0B18' }}
                initial={{ x: 0, scale: 1, opacity: 1, rotate: 0 }}
                animate={{ x: [0, -12, 12, -8, 8, 0], scale: [1, 1.1, 1, 0.9, 0.8], opacity: [1, 1, 1, 0.6, 0], rotate: [0, -6, 6, -4, 12] }}
                transition={{ duration: 0.9, ease: 'easeIn' }}
              >
                {fl.label}
                {/* giant red X stamps on top */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center font-display font-black text-[64px] text-coral"
                  style={{ textShadow: '0 0 10px #FF7A59', WebkitTextStroke: '3px #0B0B18', paintOrder: 'stroke fill' }}
                  initial={{ scale: 2.2, opacity: 0, rotate: -12 }}
                  animate={{ scale: [2.2, 1.2, 1.1], opacity: [0, 1, 1], rotate: [-12, 8, 0] }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  ✕
                </motion.div>
              </motion.div>
              {/* -50 floats up in coral */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 font-display font-black text-2xl text-coral whitespace-nowrap"
                style={{ top: -12, WebkitTextStroke: '2px #0B0B18', paintOrder: 'stroke fill' }}
                initial={{ y: 0, opacity: 0, scale: 0.6 }}
                animate={{ y: -60, opacity: [0, 1, 1, 0], scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                MISS
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Full-height lane tap buttons — tap anywhere in the lane column, not just
            the bottom bar. Each lane has clear hover + click feedback. */}
        <div className="absolute inset-0 flex z-10">
          {[0, 1, 2].map(l => {
            const color = ['#21E6F0','#FF3DA8','#FFE14A'][l]
            const flashUntil = laneFlash[l] ?? 0
            const isFlashing = performance.now() < flashUntil
            return (
              <button
                key={l}
                onClick={() => tapLane(l)}
                className="lane-btn group flex-1 relative flex items-end justify-center pb-5 border-r border-ink/20 last:border-r-0 font-display font-bold text-2xl outline-none"
                style={{ color, background: 'transparent', ['--lane-color' as any]: color }}
              >
                {/* Hover glow — vertical gradient from the lane colour at bottom up */}
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: `linear-gradient(180deg, ${color}00 0%, ${color}22 70%, ${color}55 100%)` }}
                />
                {/* Click flash — triggered via laneFlash state; covers the whole lane for ~180ms */}
                <span
                  className="pointer-events-none absolute inset-0 transition-opacity duration-200"
                  style={{
                    background: `linear-gradient(180deg, ${color}22 0%, ${color}66 100%)`,
                    opacity: isFlashing ? 1 : 0,
                    boxShadow: isFlashing ? `inset 0 0 60px ${color}` : 'none'
                  }}
                />
                {/* Active-state ring on press */}
                <span
                  className="pointer-events-none absolute inset-0 border-2 border-transparent group-active:border-white/60 group-active:bg-white/10 transition-colors duration-75"
                />
                {/* A/S/D label */}
                <span className="relative z-10 drop-shadow-[0_2px_0_#0B0B18] group-hover:scale-110 group-active:scale-95 transition-transform">
                  {LANE_LABELS[l]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tutorial completion flash */}
      <AnimatePresence>
        {mode === 'tutorial' && null /* no extra overlay needed; all inline */}
      </AnimatePresence>
    </div>
  )
}
