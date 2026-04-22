import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import type { HotColdQuestion } from '../data/quiz'
import { sfx } from '../sound'

/**
 * Hot/Cold: move a reticle across a map. The background glow + colour intensifies as
 * the reticle nears the target. Tap "Drop pin" to lock in — close enough = correct.
 */
export function HotCold({ q, onFinish }: { q: HotColdQuestion; onFinish: (correct: boolean) => void }) {
  const W = 780
  const H = 460
  const x = useMotionValue(W / 2)
  const y = useMotionValue(H / 2)
  const [now, setNow] = useState({ x: W / 2, y: H / 2 })
  const [locked, setLocked] = useState(false)
  const [shake, setShake] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  // Distance in playfield fractions
  const distFrac = Math.hypot((now.x / W) - q.target.x, (now.y / H) - q.target.y)
  // 0 = on target, 1 = far
  const coldness = Math.min(1, distFrac / 0.5)
  const heat = 1 - coldness
  const glow = `radial-gradient(circle at ${now.x}px ${now.y}px, rgba(255,122,89,${0.15 + 0.6 * heat}) 0%, transparent 200px)`
  const ambient = heat > 0.6 ? 'ON FIRE' : heat > 0.35 ? 'HOT' : heat > 0.15 ? 'WARM' : heat > 0.05 ? 'COOL' : 'COLD'
  const ambientColor = heat > 0.6 ? '#FF3DA8' : heat > 0.35 ? '#FF7A59' : heat > 0.15 ? '#FFE14A' : heat > 0.05 ? '#21E6F0' : '#21E6F0'

  // Keep a React state in sync with motion values for the heat calc
  x.on('change', (v) => setNow(prev => ({ ...prev, x: v })))
  y.on('change', (v) => setNow(prev => ({ ...prev, y: v })))

  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (locked) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const nx = Math.max(0, Math.min(W, e.clientX - rect.left))
    const ny = Math.max(0, Math.min(H, e.clientY - rect.top))
    x.set(nx)
    y.set(ny)
  }

  function dropPin() {
    if (locked) return
    const fx = +(now.x / W).toFixed(4)
    const fy = +(now.y / H).toFixed(4)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[HotCold] click at x=${fx}, y=${fy}  (target ${q.target.x}, ${q.target.y}, dist=${distFrac.toFixed(4)})`)
    }
    const ok = distFrac <= q.tolerance + 0.04 // small forgiveness
    if (ok) {
      sfx.correct()
      setLocked(true)
      setTimeout(() => onFinish(true), 900)
    } else {
      sfx.wrong()
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setLocked(true)
      setTimeout(() => onFinish(false), 1000)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
      <motion.h2 className="title text-3xl md:text-5xl text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {q.prompt}
      </motion.h2>

      <div className="chip font-mono tracking-widest" style={{ color: ambientColor }}>
        {ambient}
      </div>

      <motion.div
        ref={stageRef}
        onPointerMove={move}
        onClick={dropPin}
        className="relative rounded-3xl border-4 border-ink overflow-hidden shadow-pop cursor-crosshair select-none"
        style={{ width: W, height: H, background: '#1C1540' }}
        animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <MapArt map={q.map} />

        {/* Heat glow following the reticle */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: glow }} />

        {/* Reticle */}
        <motion.div
          className="absolute pointer-events-none"
          style={{ left: now.x, top: now.y, transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            className="w-12 h-12 rounded-full border-4 flex items-center justify-center"
            style={{ borderColor: ambientColor, boxShadow: `0 0 20px ${ambientColor}` }}
            animate={{ scale: [1, 1 + 0.25 * heat, 1] }}
            transition={{ duration: Math.max(0.35, 0.9 - heat * 0.6), repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: ambientColor }} />
          </motion.div>
        </motion.div>

        {/* On lock, show the true target */}
        {locked && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ left: q.target.x * W, top: q.target.y * H, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <div className="w-14 h-14 rounded-full border-4 border-mint flex items-center justify-center" style={{ boxShadow: '0 0 24px #59F3B1' }}>
              <div className="w-3 h-3 rounded-full bg-mint" />
            </div>
            <div className="font-display font-bold text-mint text-sm mt-1 text-center">Target</div>
          </motion.div>
        )}

        {/* Dev-only: coordinate HUD + live target crosshair so we can calibrate. */}
        {import.meta.env.DEV && (
          <>
            {/* Live cursor readout */}
            <div
              className="absolute top-2 left-2 z-50 font-mono text-[11px] tracking-widest bg-ink/85 text-lemon border border-lemon/50 rounded px-2 py-1 pointer-events-none"
            >
              cursor  x: {(now.x / W).toFixed(3)}  y: {(now.y / H).toFixed(3)}
              <br />
              target  x: {q.target.x.toFixed(3)}  y: {q.target.y.toFixed(3)}  tol: {q.tolerance}
              <br />
              dist    {distFrac.toFixed(3)}
            </div>
            {/* Always-visible target crosshair in dev (hidden in prod until lock) */}
            {!locked && (
              <div
                className="absolute pointer-events-none z-40"
                style={{ left: q.target.x * W, top: q.target.y * H, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-10 h-10 border-2 border-dashed border-mint rounded-full" style={{ boxShadow: '0 0 12px #59F3B1' }} />
                <div className="absolute left-1/2 top-1/2 w-1 h-6 -translate-x-1/2 -translate-y-1/2 bg-mint" />
                <div className="absolute left-1/2 top-1/2 h-1 w-6 -translate-x-1/2 -translate-y-1/2 bg-mint" />
              </div>
            )}
          </>
        )}
      </motion.div>

      <div className="chip font-mono tracking-widest text-white/60">Tap the map when you're on the spot</div>
    </div>
  )
}

function MapArt({ map }: { map: 'world' | 'body' }) {
  if (map === 'body') {
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 780 460" preserveAspectRatio="xMidYMid meet">
        <rect width="780" height="460" fill="#141028" />
        <circle cx="390" cy="100" r="70" fill="#3A4C6B" stroke="#0B0B18" strokeWidth="3" />
        <path d="M320 170 Q390 180 460 170 L500 280 Q460 340 390 340 Q320 340 280 280 Z" fill="#3A4C6B" stroke="#0B0B18" strokeWidth="3" />
        <rect x="360" y="330" width="24" height="100" fill="#3A4C6B" stroke="#0B0B18" strokeWidth="3" />
        <rect x="396" y="330" width="24" height="100" fill="#3A4C6B" stroke="#0B0B18" strokeWidth="3" />
      </svg>
    )
  }
  // Real world map — public-domain SVG from Wikimedia (blank landmass version).
  return (
    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#1A3A6B 0%, #0E1F3E 100%)' }}>
      <img
        src="/world.svg"
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ filter: 'brightness(0) saturate(100%) invert(86%) sepia(31%) saturate(350%) hue-rotate(85deg) brightness(95%)', objectFit: 'fill' }}
      />
    </div>
  )
}
