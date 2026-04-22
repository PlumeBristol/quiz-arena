import { motion } from 'framer-motion'
import { useState } from 'react'
import type { PinchQuestion } from '../data/quiz'
import { sfx } from '../sound'

/**
 * Pinch/Scale — desert scene reconstructed from layered SVG assets (bg + man + elephant).
 * One shared pxPerMetre drives every size in the scene: the man is fixed at his real
 * height (1.7m), the elephant scales with the slider using the same px/m ratio.
 */
export function Pinch({ q, onFinish }: { q: PinchQuestion; onFinish: (correct: boolean) => void }) {
  const SCENE_W = 920
  const SCENE_H = 520
  const MAX_METRES = 6
  // Figure area takes the bottom ~82% of the scene — this bumps the human up to
  // ~120px so he reads at a glance instead of being a tiny silhouette.
  const PX_PER_M = (SCENE_H * 0.82) / MAX_METRES

  const minSize = 0.3
  const maxSize = MAX_METRES
  const START = 0.8
  const [sizeM, setSizeM] = useState<number>(START)
  const [locked, setLocked] = useState(false)
  const [shake, setShake] = useState(false)

  function submit() {
    if (locked) return
    const ok = Math.abs(sizeM - q.realSize) / q.realSize <= q.tolerance
    if (ok) {
      sfx.correct()
      setLocked(true)
      setTimeout(() => onFinish(true), 900)
    } else {
      sfx.wrong()
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setLocked(true)
      // Show the correct size by animating the elephant to it.
      setTimeout(() => setSizeM(q.realSize), 600)
      setTimeout(() => onFinish(false), 2200)
    }
  }

  // Both SVGs have a small amount of vertical padding around the figure inside their
  // viewBox. We scale each image up by the inverse of its figure-fill ratio so that a
  // stated 1.7 m renders as the same visual height on both.
  const MAN_BODY_RATIO = 0.78
  const ELEPHANT_BODY_RATIO = 0.78
  const manPx = (q.reference.size * PX_PER_M) / MAN_BODY_RATIO
  const elephantPx = sizeM * PX_PER_M
  const renderedElephantHeight = elephantPx / ELEPHANT_BODY_RATIO

  const sliderPct = ((sizeM - minSize) / (maxSize - minSize)) * 100
  const tolPctLeft = ((Math.max(minSize, q.realSize * (1 - q.tolerance)) - minSize) / (maxSize - minSize)) * 100
  const tolPctWidth =
    ((Math.min(maxSize, q.realSize * (1 + q.tolerance)) - Math.max(minSize, q.realSize * (1 - q.tolerance))) /
      (maxSize - minSize)) *
    100

  const GROUND_OFFSET = 20 // px from bottom of scene to the "ground line" figures stand on
  const isCorrect = Math.abs(sizeM - q.realSize) / q.realSize <= q.tolerance

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
      <motion.h2
        className="title text-3xl md:text-5xl text-center max-w-3xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {q.prompt}
      </motion.h2>

      {/*
        Outer container is larger than the inner scene frame, so the elephant can
        grow past the scene edges into the surrounding margin. The scene frame
        (clipped, rounded) sits centred inside; the figures live in a sibling layer
        with overflow visible so they can spill out.
      */}
      <motion.div
        className="relative"
        style={{ width: SCENE_W, height: SCENE_H }}
        animate={shake ? { x: [0, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* Scene frame — fills the container and clips the bg image to its rounded corners. */}
        <div
          className="absolute inset-0 rounded-3xl border-4 border-ink overflow-hidden shadow-pop"
          style={{ background: 'linear-gradient(180deg, #9FC5E8 0%, #C9D7E8 45%, #F4C88A 60%, #E59B4E 100%)' }}
        >
          <img
            src="/bg.svg"
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full select-none pointer-events-none"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Figures overlay — same size as the container but overflow:visible so the
            elephant can bleed past the rounded border as it grows. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          {/* Man — fixed at his real height (1.7m) */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: '26%', bottom: GROUND_OFFSET, transform: 'translateX(-50%)' }}
          >
            <img src="/man.svg" alt="" draggable={false} style={{ height: manPx, width: 'auto', display: 'block' }} />
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-ink/90 border-2 border-cyan rounded-full px-3 py-0.5 backdrop-blur-sm">
              <span className="font-display font-bold text-cyan text-xs md:text-sm leading-none">{q.reference.label}</span>
              <span className="font-mono text-white text-[11px] leading-none">{q.reference.size}m</span>
            </div>
          </div>

          {/* Elephant — scales with the slider, overflow allowed */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: '66%', bottom: GROUND_OFFSET, transform: 'translateX(-50%)' }}
          >
            <img
              src="/elephant.svg"
              alt=""
              draggable={false}
              style={{
                height: renderedElephantHeight,
                width: 'auto',
                display: 'block',
                // Slow the transition while locked so the animated grow-to-correct
                // is visibly readable; fast while the player is actively dragging.
                transition: locked ? 'height 1.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'height 90ms ease-out',
                maxWidth: 'none'
              }}
            />
            <div
              className="mt-1.5 inline-flex items-center gap-1.5 bg-ink/90 rounded-full px-3 py-0.5 backdrop-blur-sm border-2"
              style={{ borderColor: locked ? (isCorrect ? '#59F3B1' : '#FF7A59') : '#FFE14A' }}
            >
              <span className="font-display font-bold text-lemon text-xs md:text-sm leading-none">{q.object.label}</span>
              <span
                className="font-mono text-[11px] leading-none"
                style={{ color: locked ? (isCorrect ? '#59F3B1' : '#FF7A59') : '#FFFFFF' }}
              >
                {sizeM.toFixed(1)}m
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Horizontal slider */}
      <div className="w-[640px] flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-white/70 text-xs tracking-widest">
          <span>◀ SMALLER</span>
          <span className="text-lemon font-display font-bold text-xl">{sizeM.toFixed(1)} m</span>
          <span>BIGGER ▶</span>
        </div>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan via-magenta to-lemon"
              style={{ width: `${sliderPct}%` }}
            />
            {locked && (
              <div
                className="absolute inset-y-0 bg-mint/60 border-x-2 border-mint"
                style={{ left: `${tolPctLeft}%`, width: `${tolPctWidth}%` }}
              />
            )}
          </div>
          <input
            type="range"
            min={minSize}
            max={maxSize}
            step={0.1}
            value={sizeM}
            disabled={locked}
            onChange={(e) => {
              sfx.hover()
              setSizeM(parseFloat(e.target.value))
            }}
            className="absolute inset-0 w-full opacity-0 cursor-grab active:cursor-grabbing disabled:cursor-not-allowed"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-4 border-ink shadow-pop flex items-center justify-center text-ink font-bold pointer-events-none"
            style={{ left: `calc(${sliderPct}% - 20px)` }}
          >
            ↔
          </div>
        </div>
      </div>

      <motion.button
        className="btn"
        onClick={submit}
        disabled={locked}
        whileHover={!locked ? { scale: 1.05 } : undefined}
        whileTap={!locked ? { scale: 0.96 } : undefined}
      >
        {locked ? '…' : 'Lock in size'}
      </motion.button>
    </div>
  )
}
