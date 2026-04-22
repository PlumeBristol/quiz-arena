import { motion } from 'framer-motion'

export function Timer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = Math.max(0, Math.min(1, timeLeft / total))
  const critical = timeLeft <= 5
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={`font-mono font-bold text-2xl ${critical ? 'text-coral' : 'text-lemon'}`}
        animate={critical ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: critical ? Infinity : 0 }}
      >
        {Math.ceil(timeLeft)}s
      </motion.div>
      <div className="relative w-48 h-3 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 ${critical ? 'bg-coral' : 'bg-gradient-to-r from-lemon to-mint'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  )
}
