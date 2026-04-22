import { motion, useMotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import type { DragQuestion } from '../data/quiz'
import { sfx } from '../sound'

type Placed = Record<string, string> // itemId → zoneId

export function Drag({ q, onFinish }: { q: DragQuestion; onFinish: (correct: number, total: number) => void }) {
  const [placed, setPlaced] = useState<Placed>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  // Snap radius (% of container); anything within this range gets pulled in and,
  // on release, dropped into the zone.
  const SNAP_RADIUS_PCT = 16

  function tryPlace(itemId: string, clientX: number, clientY: number) {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    let best: { id: string; d: number } | null = null
    for (const z of q.zones) {
      const d = Math.hypot(z.x - x, z.y - y)
      if (!best || d < best.d) best = { id: z.id, d }
    }
    if (best && best.d < SNAP_RADIUS_PCT) {
      sfx.pop()
      setPlaced(p => ({ ...p, [itemId]: best!.id }))
    } else {
      sfx.wrong()
    }
  }

  function check() {
    if (done) return
    setDone(true)
    const correctCount = q.items.filter(it => placed[it.id] === it.zone).length
    sfx.correct()
    setTimeout(() => onFinish(correctCount, q.items.length), 700)
  }

  const allPlaced = Object.keys(placed).length === q.items.length

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 py-6">
      <motion.h2 className="title text-3xl md:text-5xl text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {q.prompt}
      </motion.h2>

      <div className="flex gap-6 w-full max-w-6xl items-center justify-center">
        {/* scene */}
        <div ref={containerRef} className="relative w-[560px] h-[480px] rounded-3xl border-4 border-ink overflow-hidden shadow-pop" style={{ background: '#BEDFE8' }}>
          <img
            src="/volcano.jpg"
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full select-none pointer-events-none"
            style={{ objectFit: 'cover' }}
          />
          {q.zones.map(z => {
            const filledBy = Object.entries(placed).find(([, zid]) => zid === z.id)?.[0]
            const placedItem = filledBy ? q.items.find(it => it.id === filledBy) : undefined
            const isCorrect = done && placedItem && placedItem.zone === z.id
            const isWrong = done && placedItem && placedItem.zone !== z.id
            function releaseTag(e: React.MouseEvent) {
              e.stopPropagation()
              if (done || !filledBy) return
              sfx.hover()
              setPlaced(p => {
                const next = { ...p }
                delete next[filledBy]
                return next
              })
            }
            const isHovered = hoveredZone === z.id && !filledBy
            return (
              <motion.div
                key={z.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed flex items-center justify-center text-xs font-mono text-white/80"
                style={{
                  left: `${z.x}%`,
                  top: `${z.y}%`,
                  width: 86,
                  height: 86,
                  boxShadow: isHovered
                    ? '0 0 0 3px rgba(11,11,24,0.7), 0 0 32px #FFE14A, inset 0 0 28px rgba(255,225,74,0.45)'
                    : '0 0 0 2px rgba(11,11,24,0.55), 0 0 18px rgba(11,11,24,0.6), inset 0 0 18px rgba(11,11,24,0.35)',
                  backgroundColor: isHovered ? 'rgba(255,225,74,0.25)' : 'rgba(11,11,24,0.18)'
                }}
                animate={{
                  scale: filledBy ? 1 : isHovered ? 1.2 : [1, 1.08, 1],
                  borderColor: isCorrect ? '#59F3B1' : isWrong ? '#FF7A59' : isHovered ? '#FFFFFF' : '#FFE14A'
                }}
                transition={{ duration: isHovered ? 0.2 : 1.4, repeat: filledBy || isHovered ? 0 : Infinity }}
              >
                {placedItem && (
                  <motion.button
                    onClick={releaseTag}
                    className="font-display font-bold text-white text-center px-2 rounded-xl py-1 border-2 border-ink text-sm relative"
                    style={{ background: isCorrect ? '#59F3B1' : isWrong ? '#FF7A59' : '#FFE14A', color: '#0B0B18' }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={!done ? { scale: 1.08 } : undefined}
                    whileTap={!done ? { scale: 0.92 } : undefined}
                    title={done ? undefined : 'Tap to remove'}
                  >
                    {placedItem.label}
                    {!done && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center border border-white/40">×</span>
                    )}
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* draggable labels */}
        <div className="flex flex-col gap-3 w-[260px]">
          {q.items.map(it => {
            const isPlaced = !!placed[it.id]
            if (isPlaced) return (
              <div key={it.id} className="h-14 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center text-white/30 text-xs font-mono tracking-widest">PLACED — TAP × TO REMOVE</div>
            )
            return (
              <DraggableLabel
                key={it.id}
                label={it.label}
                zones={q.zones}
                containerRef={containerRef}
                snapRadiusPct={SNAP_RADIUS_PCT}
                onHoverZone={setHoveredZone}
                onDrop={(x, y) => tryPlace(it.id, x, y)}
              />
            )
          })}
          <motion.button
            className="btn mt-4 text-lg"
            onClick={check}
            disabled={!allPlaced || done}
            whileHover={allPlaced ? { scale: 1.04 } : undefined}
            whileTap={allPlaced ? { scale: 0.96 } : undefined}
            animate={allPlaced && !done ? { y: [0, -2, 0] } : {}}
            transition={{ duration: 1, repeat: allPlaced && !done ? Infinity : 0 }}
            style={{ opacity: allPlaced ? 1 : 0.5 }}
          >
            {done ? 'Checking…' : 'Check'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

type Zone = { id: string; x: number; y: number; label: string }

function DraggableLabel({
  label,
  zones,
  containerRef,
  snapRadiusPct,
  onHoverZone,
  onDrop
}: {
  label: string
  zones: Zone[]
  containerRef: React.RefObject<HTMLDivElement>
  snapRadiusPct: number
  onHoverZone: (id: string | null) => void
  onDrop: (x: number, y: number) => void
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <motion.button
      ref={btnRef}
      className="h-14 rounded-2xl bg-lemon text-ink border-4 border-ink px-4 font-display font-bold text-lg shadow-pop select-none cursor-grab active:cursor-grabbing"
      drag
      dragSnapToOrigin
      dragElastic={0.8}
      style={{ x, y }}
      whileDrag={{ scale: 1.08, rotate: 2, zIndex: 30 }}
      onDrag={(_, info) => {
        const btn = btnRef.current
        const container = containerRef.current
        if (!btn || !container) return
        const cRect = container.getBoundingClientRect()
        // CURSOR position in container-% — the cursor is what the player is tracking.
        const cx = ((info.point.x) - cRect.left) / cRect.width * 100
        const cy = ((info.point.y) - cRect.top) / cRect.height * 100

        // Nearest zone from the cursor
        let best: { z: Zone; d: number } | null = null
        for (const z of zones) {
          const d = Math.hypot(z.x - cx, z.y - cy)
          if (!best || d < best.d) best = { z, d }
        }

        if (best && best.d < snapRadiusPct) {
          onHoverZone(best.z.id)
          // Pull the LABEL's body toward the zone centre so it visually lines up,
          // while the cursor stays wherever the player grabbed it. Feels like the
          // zone is magnetic to the cursor, tugging the label along for the ride.
          const btnRect = btn.getBoundingClientRect()
          const targetX = cRect.left + (best.z.x / 100) * cRect.width
          const targetY = cRect.top + (best.z.y / 100) * cRect.height
          const curCx = btnRect.left + btnRect.width / 2
          const curCy = btnRect.top + btnRect.height / 2
          const dx = targetX - curCx
          const dy = targetY - curCy
          const t = 1 - best.d / snapRadiusPct
          const pull = Math.pow(t, 1.4) * 0.55
          x.set(x.get() + dx * pull)
          y.set(y.get() + dy * pull)
        } else {
          onHoverZone(null)
        }
      }}
      onDragEnd={(_, info) => {
        onHoverZone(null)
        // Use the cursor position, not the label's centre — that's what the player
        // was aiming with. If cursor is over a zone, it counts as dropped there.
        onDrop(info.point.x, info.point.y)
      }}
    >
      {label}
    </motion.button>
  )
}

function VolcanoArt() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="v-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A4C6B" />
          <stop offset="100%" stopColor="#1C1540" />
        </linearGradient>
        <radialGradient id="v-lava" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#FFE14A" />
          <stop offset="100%" stopColor="#FF7A59" />
        </radialGradient>
      </defs>
      <rect width="800" height="550" fill="url(#v-sky)" />
      {/* Moon */}
      <circle cx="120" cy="90" r="28" fill="#FAF6FF" opacity="0.7" />
      {/* Volcano silhouette */}
      <path d="M120 430 L340 210 L360 190 L380 170 L420 170 L440 190 L460 210 L680 430 Z" fill="#2D1F3A" stroke="#0B0B18" strokeWidth="4" />
      {/* Magma chamber glow */}
      <ellipse cx="400" cy="470" rx="140" ry="24" fill="url(#v-lava)" opacity="0.8" />
      {/* Lava flow */}
      <path d="M460 220 Q520 300 580 380" stroke="#FF7A59" strokeWidth="16" strokeLinecap="round" opacity="0.8" />
      <path d="M460 220 Q520 300 580 380" stroke="#FFE14A" strokeWidth="6" strokeLinecap="round" />
      {/* Ash cloud */}
      <g>
        <ellipse cx="400" cy="80" rx="140" ry="34" fill="#6b6272" opacity="0.8" />
        <ellipse cx="360" cy="70" rx="70" ry="24" fill="#8a8093" opacity="0.8" />
        <ellipse cx="460" cy="75" rx="80" ry="26" fill="#4b4356" opacity="0.8" />
      </g>
      {/* Sparks */}
      {Array.from({ length: 10 }).map((_, i) => {
        const cx = 360 + (i * 37) % 100
        const cy = 140 + (i * 23) % 60
        return <circle key={i} cx={cx} cy={cy} r="2.5" fill="#FFE14A" opacity={0.6 + (i % 3) * 0.15} />
      })}
    </svg>
  )
}
