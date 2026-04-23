import { motion, AnimatePresence } from 'framer-motion'

// Burst of confetti-style particles emitted from a point.
export function Burst({ x = 50, y = 50, count = 22, palette }: { x?: number; y?: number; count?: number; palette?: string[] }) {
  const colors = palette ?? ['#FFE14A', '#FF3DA8', '#21E6F0', '#59F3B1', '#7B2CFF']
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.4
        const dist = 140 + Math.random() * 160
        const dx = Math.cos(a) * dist
        const dy = Math.sin(a) * dist
        const size = 8 + Math.random() * 10
        const c = colors[i % colors.length]
        const shape = i % 3
        return (
          <motion.div
            key={i}
            style={{ left: `${x}%`, top: `${y}%`, background: c, width: size, height: size, borderRadius: shape === 0 ? 9999 : shape === 1 ? 2 : 0 }}
            className="absolute"
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{ x: dx, y: dy + 200, opacity: 0, rotate: 360 + Math.random() * 360, scale: 1 }}
            transition={{ duration: 1.1 + Math.random() * 0.4, ease: [0.2, 0.8, 0.3, 1] }}
          />
        )
      })}
    </div>
  )
}

export type BgTheme = 'space' | 'lava' | 'ocean' | 'desert' | 'neon' | 'ancient' | 'lunar' | 'jungle'

// Layered parallax backgrounds — each theme is a set of crisp shapes drifting on
// a flat gradient. Theme cross-fades in place when it changes between questions.
export function BackgroundOrbs({ theme = 'space' }: { theme?: BgTheme }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={theme}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {theme === 'space' && <SpaceBg />}
          {theme === 'lava' && <LavaBg />}
          {theme === 'ocean' && <OceanBg />}
          {theme === 'desert' && <DesertBg />}
          {theme === 'neon' && <NeonBg />}
          {theme === 'ancient' && <AncientBg />}
          {theme === 'lunar' && <LunarBg />}
          {theme === 'jungle' && <JungleBg />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------- SPACE ---------- */
function SpaceBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1A0638 0%, #3B0E5C 50%, #5C1675 85%, #6B1A72 100%)' }} />
      <motion.div className="absolute inset-0" animate={{ x: [0, -30, 0] }} transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}>
        {FAR_STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }}
            animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
            transition={{ duration: 2 + s.twinkle, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
      <motion.div className="absolute inset-0" animate={{ x: [0, 40, 0] }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}>
        <div className="absolute rounded-full" style={{ left: '8%', top: '12%', width: 70, height: 70, background: '#F4E8C5', boxShadow: '0 0 40px rgba(244,232,197,0.35)' }}>
          <div className="absolute rounded-full" style={{ left: 14, top: 22, width: 12, height: 12, background: 'rgba(0,0,0,0.08)' }} />
          <div className="absolute rounded-full" style={{ left: 38, top: 12, width: 8, height: 8, background: 'rgba(0,0,0,0.08)' }} />
          <div className="absolute rounded-full" style={{ left: 30, top: 42, width: 16, height: 16, background: 'rgba(0,0,0,0.08)' }} />
        </div>
        <motion.div className="absolute" style={{ right: '12%', top: '22%', width: 110, height: 110 }} animate={{ rotate: [0, 360] }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}>
          <div className="absolute rounded-full" style={{ left: 15, top: 20, width: 80, height: 80, background: 'radial-gradient(circle at 35% 30%, #59F3B1, #21E6F0 70%)' }} />
          <div className="absolute" style={{ left: -5, top: 48, width: 120, height: 18, border: '3px solid rgba(89,243,177,0.7)', borderRadius: '50%', transform: 'rotate(-18deg)' }} />
        </motion.div>
        <div className="absolute rounded-full" style={{ left: '18%', top: '70%', width: 38, height: 38, background: 'radial-gradient(circle at 30% 30%, #FF7A59, #FF3DA8 80%)', boxShadow: '0 0 20px rgba(255,61,168,0.5)' }} />
        {SPARKLES.map((s, i) => <Sparkle key={i} x={s.x} y={s.y} size={s.size} color={s.color} delay={s.delay} />)}
      </motion.div>
      <motion.div className="absolute inset-0" animate={{ x: [0, -60, 0] }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}>
        <motion.div className="absolute" style={{ left: '50%', top: '8%', width: 180, height: 3, background: 'linear-gradient(90deg, transparent 0%, rgba(255,225,74,0) 0%, #FFE14A 90%, #fff 100%)', transform: 'rotate(-15deg)', boxShadow: '0 0 12px rgba(255,225,74,0.8)' }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.1, 0.9, 1], repeatDelay: 7, ease: 'easeOut' }} />
        <motion.div className="absolute" style={{ right: '6%', bottom: '8%', width: 160, height: 160 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="absolute rounded-full" style={{ inset: 0, background: 'radial-gradient(circle at 30% 28%, #FFE14A, #FF7A59 55%, #7B2CFF 95%)', boxShadow: '0 0 50px rgba(255,61,168,0.45)' }} />
        </motion.div>
      </motion.div>
    </>
  )
}

/* ---------- LAVA ---------- */
function LavaBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #2B0712 0%, #5A1218 40%, #A82617 80%, #E25522 100%)' }} />
      {/* Distant dark mountains silhouette */}
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 1000 260" preserveAspectRatio="none" style={{ height: '35%' }}>
        <path d="M0 260 L0 180 L120 120 L200 170 L340 80 L500 150 L640 100 L780 170 L900 130 L1000 180 L1000 260 Z" fill="#1a0408" opacity="0.75" />
      </svg>
      {/* Floating embers — drift upward */}
      <motion.div className="absolute inset-0" animate={{ x: [0, 30, 0] }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}>
        {EMBERS.map((e, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.size, height: e.size, background: e.color, boxShadow: `0 0 ${e.size * 2}px ${e.color}` }}
            animate={{ y: [0, -200, -400], opacity: [0, 1, 0], scale: [0.6, 1, 0.3] }}
            transition={{ duration: 6 + e.delay * 1.5, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
      {/* Glowing sun/volcanic heat in top corner */}
      <motion.div
        className="absolute rounded-full"
        style={{ left: '-6%', top: '-10%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(255,200,60,0.5) 0%, rgba(255,100,30,0.15) 50%, transparent 80%)' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* A few sparks arcing */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ left: `${30 + i * 20}%`, top: '55%', width: 5, height: 5, background: '#FFE14A', boxShadow: '0 0 10px #FFE14A' }}
          animate={{ y: [0, -140, -80], x: [0, 40 + i * 10, 60 + i * 15], opacity: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

/* ---------- OCEAN ---------- */
function OceanBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #5AB4D8 0%, #2B7CB5 35%, #0F3F75 75%, #061E3D 100%)' }} />
      {/* Light rays from above */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)' }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Angled light shafts */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 30}%`, top: 0, width: 60, height: '70%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
            transform: `skewX(${-8 + i * 2}deg)`
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Bubbles — rise up */}
      <motion.div className="absolute inset-0" animate={{ x: [0, -20, 0] }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
        {BUBBLES.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/50"
            style={{ left: `${b.x}%`, bottom: 0, width: b.size, height: b.size, background: 'rgba(255,255,255,0.25)' }}
            animate={{ y: [0, -800], opacity: [0, 0.9, 0.9, 0], x: [0, Math.sin(i) * 30, Math.sin(i + 1) * 20] }}
            transition={{ duration: 8 + b.delay, repeat: Infinity, delay: b.delay, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
      {/* Fish silhouettes */}
      <motion.div className="absolute" style={{ top: '35%' }} animate={{ x: ['100vw', '-20vw'] }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}>
        <div className="relative w-16 h-8" style={{ background: 'rgba(11,11,24,0.35)', clipPath: 'polygon(0% 50%, 20% 0%, 75% 10%, 100% 50%, 75% 90%, 20% 100%)' }} />
      </motion.div>
      <motion.div className="absolute" style={{ top: '70%' }} animate={{ x: ['-20vw', '110vw'] }} transition={{ duration: 70, repeat: Infinity, ease: 'linear', delay: 15 }}>
        <div className="relative w-10 h-5" style={{ background: 'rgba(11,11,24,0.3)', clipPath: 'polygon(100% 50%, 80% 0%, 25% 10%, 0% 50%, 25% 90%, 80% 100%)' }} />
      </motion.div>
    </>
  )
}

/* ---------- DESERT ---------- */
function DesertBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #D8B48A 0%, #E8A96A 30%, #E07C3E 70%, #B5482A 100%)' }} />
      {/* Sun */}
      <motion.div
        className="absolute rounded-full"
        style={{ right: '12%', top: '10%', width: 120, height: 120, background: 'radial-gradient(circle, #FFE8B0 0%, #F8A048 70%, transparent 100%)', boxShadow: '0 0 80px rgba(255,200,100,0.5)' }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Distant dune silhouettes — parallax */}
      <motion.div className="absolute inset-x-0" style={{ bottom: '25%' }} animate={{ x: [0, -30, 0] }} transition={{ duration: 60, repeat: Infinity, ease: 'easeInOut' }}>
        <svg className="w-full" viewBox="0 0 1000 150" preserveAspectRatio="none" style={{ height: 100 }}>
          <path d="M0 150 Q150 90 300 120 T600 110 T1000 125 L1000 150 Z" fill="#9A5C3A" opacity="0.6" />
        </svg>
      </motion.div>
      <motion.div className="absolute inset-x-0" style={{ bottom: '10%' }} animate={{ x: [0, 50, 0] }} transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}>
        <svg className="w-full" viewBox="0 0 1000 150" preserveAspectRatio="none" style={{ height: 130 }}>
          <path d="M0 150 Q200 60 400 100 T800 80 T1000 110 L1000 150 Z" fill="#6E3821" opacity="0.85" />
        </svg>
      </motion.div>
      {/* Heat haze shimmer + sand particles */}
      {HEAT_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: 3, height: 3, background: 'rgba(255,240,200,0.7)' }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + p.delay, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ---------- NEON ---------- */
function NeonBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0B0630 0%, #2A0A4E 50%, #0B0630 100%)' }} />
      {/* Horizon grid lines */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: '40%', perspective: '600px' }}>
        <div
          className="absolute inset-0 origin-bottom"
          style={{
            transform: 'rotateX(60deg)',
            backgroundImage:
              'linear-gradient(0deg, rgba(255,61,168,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(33,230,240,0.35) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      {/* Pulsing geometric shapes */}
      {NEON_SHAPES.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            border: `3px solid ${shape.color}`,
            transform: shape.shape === 'diamond' ? 'rotate(45deg)' : 'none',
            borderRadius: shape.shape === 'circle' ? '50%' : shape.shape === 'rounded' ? '25%' : '0',
            boxShadow: `0 0 22px ${shape.color}`
          }}
          animate={{
            rotate: shape.shape === 'diamond' ? [45, 55, 45] : [0, 8, 0],
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 3 + shape.delay, repeat: Infinity, delay: shape.delay, ease: 'easeInOut' }}
        />
      ))}
      {/* Sparkles */}
      {SPARKLES.map((s, i) => <Sparkle key={i} x={s.x} y={s.y} size={s.size} color={s.color} delay={s.delay} />)}
    </>
  )
}

// Deterministic star field — positions and sizes are fixed so there's no re-shuffle on HMR.
const FAR_STARS = Array.from({ length: 70 }).map((_, i) => {
  const seed = (i * 2654435761) >>> 0
  const r = (n: number) => ((seed >> n) & 0xff) / 255
  return {
    x: r(0) * 100,
    y: r(8) * 100,
    size: 1 + Math.round(r(16) * 3),
    opacity: 0.35 + r(20) * 0.55,
    twinkle: r(4) * 3,
    delay: r(12) * 4
  }
})

const SPARKLES = [
  { x: 22, y: 30, size: 14, color: '#FFE14A', delay: 0 },
  { x: 68, y: 55, size: 18, color: '#FF3DA8', delay: 1.2 },
  { x: 42, y: 78, size: 12, color: '#21E6F0', delay: 2.4 },
  { x: 86, y: 82, size: 16, color: '#59F3B1', delay: 0.6 },
  { x: 12, y: 48, size: 11, color: '#FFFFFF', delay: 1.8 }
]

// Deterministic pseudo-random drawn from i — spreads values across 0..1 nicely.
const h = (i: number, salt: number) => {
  const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return v - Math.floor(v)
}

const EMBERS = Array.from({ length: 18 }).map((_, i) => {
  const colors = ['#FFE14A', '#FF8A3C', '#FF5722', '#FFB247']
  return {
    x: h(i, 1) * 100,
    y: 50 + h(i, 2) * 50,
    size: 4 + Math.round(h(i, 3) * 6),
    color: colors[i % colors.length],
    // Spread embers across a ~6-second window so they don't all appear at once.
    delay: h(i, 4) * 6
  }
})

const BUBBLES = Array.from({ length: 14 }).map((_, i) => ({
  x: h(i, 10) * 100,
  size: 6 + Math.round(h(i, 11) * 16),
  // Stagger bubble spawns across an 8-second window.
  delay: h(i, 12) * 8
}))

const HEAT_PARTICLES = Array.from({ length: 25 }).map((_, i) => ({
  x: h(i, 20) * 100,
  y: 60 + h(i, 21) * 35,
  delay: h(i, 22) * 4
}))

const DUST_MOTES = Array.from({ length: 18 }).map((_, i) => ({
  x: h(i, 30) * 100,
  y: h(i, 31) * 100,
  delay: h(i, 32) * 5
}))

const LEAVES = Array.from({ length: 14 }).map((_, i) => {
  const palette = ['#6FBF5F', '#4F9A3E', '#2F7A28', '#8FCF70']
  return {
    x: h(i, 40) * 100,
    y: -10 + h(i, 41) * 40,
    size: 14 + Math.round(h(i, 42) * 14),
    rot: h(i, 43) * 360,
    color: palette[i % palette.length],
    delay: h(i, 44) * 8
  }
})

const FIREFLIES = Array.from({ length: 12 }).map((_, i) => ({
  x: h(i, 50) * 100,
  y: 40 + h(i, 51) * 55,
  delay: h(i, 52) * 3
}))

const NEON_SHAPES = [
  { x: 12, y: 18, size: 55, shape: 'diamond' as const, color: '#21E6F0', delay: 0 },
  { x: 82, y: 14, size: 70, shape: 'rounded' as const, color: '#FF3DA8', delay: 0.8 },
  { x: 18, y: 65, size: 48, shape: 'circle' as const, color: '#FFE14A', delay: 1.6 },
  { x: 76, y: 62, size: 40, shape: 'diamond' as const, color: '#59F3B1', delay: 2.2 },
  { x: 48, y: 22, size: 36, shape: 'circle' as const, color: '#7B2CFF', delay: 1.0 }
]

/* ---------- ANCIENT ---------- */
function AncientBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #F4E3BA 0%, #D9B778 45%, #A97945 85%, #6E4622 100%)' }} />
      {/* Warm sun glow in top-left corner */}
      <div
        className="absolute rounded-full"
        style={{ left: '6%', top: '8%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,230,150,0.6) 0%, rgba(255,180,80,0.2) 50%, transparent 80%)' }}
      />

      {/* Silhouette landscape — pyramids on the left, Greek temple on the right */}
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ height: '48%' }}>
        <defs>
          <linearGradient id="anc-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E4622" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3A2410" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Great Pyramid */}
        <polygon points="100,300 230,90 360,300" fill="#5C3A1E" opacity="0.85" />
        <polygon points="230,90 360,300 260,300" fill="#4B2E16" opacity="0.9" />
        {/* Smaller pyramid */}
        <polygon points="360,300 440,180 520,300" fill="#5C3A1E" opacity="0.75" />
        {/* Greek temple — triangular pediment, columns, stepped base */}
        <g transform="translate(620 110)">
          <polygon points="0,50 140,0 280,50" fill="#3F2912" opacity="0.92" />
          <rect x="0" y="50" width="280" height="14" fill="#523418" opacity="0.95" />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={i} x={10 + i * 50} y="64" width="28" height="130" fill="#6B4722" opacity="0.92" />
          ))}
          <rect x="-10" y="194" width="300" height="12" fill="#3A2410" />
          <rect x="-20" y="206" width="320" height="12" fill="#2A1A0A" />
        </g>
        {/* ground */}
        <rect x="0" y="240" width="1000" height="60" fill="url(#anc-ground)" />
      </svg>

      {/* Drifting dust motes */}
      {DUST_MOTES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: 3, height: 3, background: 'rgba(255,245,220,0.8)' }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 1, 0.2], x: [0, 8, 0] }}
          transition={{ duration: 4 + p.delay, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

/* ---------- LUNAR ---------- */
function LunarBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #020011 0%, #0B0620 50%, #1D1438 100%)' }} />
      {/* Stars */}
      <motion.div className="absolute inset-0" animate={{ x: [0, -20, 0] }} transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}>
        {FAR_STARS.slice(0, 50).map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y * 0.55}%`, width: s.size, height: s.size, opacity: s.opacity }}
            animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
            transition={{ duration: 2 + s.twinkle, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
      {/* Earth — blue marble in the sky */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '70%', top: '12%', width: 130, height: 130,
          background: 'radial-gradient(circle at 30% 30%, #6BB4FF 0%, #2F6FD0 45%, #0A3A75 100%)',
          boxShadow: '0 0 50px rgba(90,170,255,0.4)'
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
      >
        {/* crude continents */}
        <div className="absolute rounded-full" style={{ left: '20%', top: '25%', width: '28%', height: '22%', background: 'rgba(70,140,70,0.65)' }} />
        <div className="absolute rounded-full" style={{ left: '55%', top: '42%', width: '30%', height: '30%', background: 'rgba(70,140,70,0.6)' }} />
      </motion.div>
      {/* Lunar surface + flag planted in the same SVG so it stays anchored to the terrain */}
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 1000 240" preserveAspectRatio="none" style={{ height: '38%' }}>
        <path d="M0 240 L0 160 Q80 120 160 150 Q260 110 340 140 Q460 100 560 135 Q680 95 780 130 Q880 105 1000 140 L1000 240 Z" fill="#BCB4B0" />
        <path d="M0 240 L0 200 Q120 180 220 195 Q340 170 460 195 Q600 175 720 200 Q840 185 1000 200 L1000 240 Z" fill="#7E7670" />
        {/* craters */}
        <ellipse cx="180" cy="175" rx="28" ry="8" fill="#95908B" />
        <ellipse cx="420" cy="165" rx="32" ry="9" fill="#95908B" />
        <ellipse cx="680" cy="170" rx="24" ry="7" fill="#95908B" />
        <ellipse cx="860" cy="160" rx="30" ry="8" fill="#95908B" />
        {/* Plume flag — base planted at y=180 on the terrain, pole rises 80 units */}
        <line x1="180" y1="100" x2="180" y2="180" stroke="#CCCCCC" strokeWidth="3" />
        <rect x="180" y="100" width="60" height="36" fill="#8064CA" stroke="#0B0B18" strokeWidth="1.5" />
        {/* Plume wordmark+icon embedded onto the flag */}
        <image href={`${import.meta.env.BASE_URL}plume-logo.svg`} x="184" y="106" width="52" height="24" preserveAspectRatio="xMidYMid meet" />
      </svg>
    </>
  )
}

/* ---------- JUNGLE ---------- */
function JungleBg() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #2E4E2A 0%, #1F3A1C 55%, #0F2010 100%)' }} />
      {/* Distant canopy silhouette */}
      <svg className="absolute inset-x-0 top-0 w-full" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ height: '35%' }}>
        <path d="M0 0 L0 160 Q60 120 120 150 Q200 100 280 145 Q360 90 440 140 Q520 95 600 140 Q680 95 760 145 Q840 100 1000 140 L1000 0 Z" fill="#1A2F17" />
      </svg>
      {/* Floating leaves */}
      <motion.div className="absolute inset-0" animate={{ x: [0, -30, 0] }} transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}>
        {LEAVES.map((l, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${l.x}%`, top: `${l.y}%`,
              width: l.size, height: l.size * 0.6,
              background: l.color,
              borderRadius: '50% 10% 50% 10%',
              transform: `rotate(${l.rot}deg)`,
              opacity: 0.85
            }}
            animate={{ y: [0, 60, 120], rotate: [l.rot, l.rot + 90, l.rot + 180], opacity: [0, 0.9, 0] }}
            transition={{ duration: 10 + l.delay, repeat: Infinity, delay: l.delay, ease: 'linear' }}
          />
        ))}
      </motion.div>
      {/* Fireflies */}
      {FIREFLIES.map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ left: `${f.x}%`, top: `${f.y}%`, width: 6, height: 6, background: '#FFF6A0', boxShadow: '0 0 14px #FFE14A' }}
          animate={{ y: [0, -20, 0], x: [0, 15, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3 + f.delay * 0.5, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
        />
      ))}
      {/* Vine silhouettes on sides */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '12%', background: 'linear-gradient(90deg, rgba(15,32,16,0.8) 0%, transparent 100%)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{ width: '12%', background: 'linear-gradient(270deg, rgba(15,32,16,0.8) 0%, transparent 100%)' }}
      />
    </>
  )
}

function Sparkle({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, transform: 'translate(-50%, -50%)' }}
      animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6], rotate: [0, 90] }}
      transition={{ duration: 2.4, repeat: Infinity, delay, ease: 'easeInOut', repeatDelay: 3 }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size, height: 2, background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 2, height: size, background: color, boxShadow: `0 0 8px ${color}` }}
      />
    </motion.div>
  )
}
