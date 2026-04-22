import { motion } from 'framer-motion'
import { sfx } from '../sound'

export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-8">
      <motion.div
        className="relative"
        initial={{ scale: 0.6, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <div className="absolute -inset-6 blur-3xl rounded-full bg-gradient-to-r from-violet via-magenta to-cyan opacity-60" />
        <div className="relative text-center">
          <div
            className="font-display text-[110px] leading-none font-bold tracking-tight"
            style={{ backgroundImage: 'linear-gradient(180deg, #FFE14A 0%, #FF3DA8 50%, #7B2CFF 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
          >
            QUIZ ARENA
          </div>
          <motion.div
            className="font-mono tracking-[0.4em] text-cyan text-lg mt-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            8 ROUNDS · EIGHT WAYS TO PLAY
          </motion.div>
        </div>
      </motion.div>


      {/* How scoring works */}
      <motion.div
        className="flex items-stretch gap-4 md:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <ScoreCard icon="✓" tint="#59F3B1" title="CORRECT" points="+500" detail="per right answer" />
        <ScoreCard icon="⚡" tint="#FFE14A" title="FAST" points="+500" detail="speed bonus" />
        <ScoreCard icon="✕" tint="#FF7A59" title="MISS" points="0" detail="wrong or timeout" />
      </motion.div>

      <motion.button
        onClick={() => { sfx.go(); onStart() }}
        className="btn text-2xl relative"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75, type: 'spring', stiffness: 220, damping: 20 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
      >
        <span>TAP TO PLAY</span>
        <span className="absolute inset-0 rounded-full border-4 border-lemon pointer-events-none animate-ripple" />
      </motion.button>

    </div>
  )
}

function ScoreCard({ icon, tint, title, points, detail }: { icon: string; tint: string; title: string; points: string; detail: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-white/8 backdrop-blur px-5 py-4 min-w-[170px]"
      style={{ borderColor: tint, boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.2), 0 0 24px ${tint}33` }}
    >
      {/* Big icon pill */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-3xl font-display font-black border-4 border-ink shadow-pop"
        style={{ background: tint, color: '#0B0B18' }}
      >
        {/* brightness(0) flattens colour emojis like ⚡ to solid black so they read on the bright pill */}
        <span style={{ filter: 'brightness(0)', display: 'inline-block', lineHeight: 1 }}>{icon}</span>
      </div>
      {/* Bold action label */}
      <div
        className="font-display font-black text-xl tracking-wide"
        style={{ color: tint, textShadow: '0 2px 0 #0B0B18, 0 0 12px rgba(0,0,0,0.4)' }}
      >
        {title}
      </div>
      {/* Big point value */}
      <div className="font-display font-black text-3xl text-white leading-none" style={{ textShadow: '0 3px 0 #0B0B18' }}>
        {points}<span className="font-mono font-bold text-sm text-white/70 ml-1">pts</span>
      </div>
      {/* Detail */}
      <div className="font-mono text-[11px] tracking-widest text-white/60 text-center">{detail}</div>
    </div>
  )
}
