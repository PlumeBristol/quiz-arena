import { motion } from 'framer-motion'
import type { Score } from '../store'
import { Burst } from './Particles'
import { sfx } from '../sound'
import { useEffect } from 'react'

export function Podium({ scores, onRestart }: { scores: Score[]; onRestart: () => void }) {
  const [first, second, third] = scores
  const you = scores.find(s => s.isYou)!
  const yourRank = scores.findIndex(s => s.isYou) + 1
  useEffect(() => { sfx.cheer() }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-8">
      <motion.div className="chip text-cyan" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        🏆 FINAL RESULTS
      </motion.div>

      <motion.h2
        className="title text-6xl md:text-7xl"
        initial={{ scale: 0.6, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        style={{ backgroundImage: 'linear-gradient(180deg,#FFE14A 0%,#FF3DA8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
      >
        WINNERS!
      </motion.h2>

      <div className="flex items-end gap-6">
        {/* 2nd */}
        {second && <PodiumStand rank={2} score={second} delay={0.2} height={180} />}
        {/* 1st */}
        {first && <PodiumStand rank={1} score={first} delay={0} height={240} isFirst />}
        {/* 3rd */}
        {third && <PodiumStand rank={3} score={third} delay={0.4} height={140} />}
      </div>

      <motion.div className="chip text-lg" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
        You finished #{yourRank} with {you.score.toLocaleString()} pts
      </motion.div>

      <motion.button
        className="btn"
        onClick={() => { sfx.go(); onRestart() }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        Play again
      </motion.button>

      <Burst x={30} y={50} count={24} palette={['#FFE14A','#FF3DA8','#7B2CFF']} />
      <Burst x={70} y={50} count={24} palette={['#21E6F0','#59F3B1','#FFE14A']} />
    </div>
  )
}

function PodiumStand({ rank, score, height, delay = 0, isFirst = false }: { rank: number; score: Score; height: number; delay?: number; isFirst?: boolean }) {
  const color = rank === 1 ? '#FFE14A' : rank === 2 ? '#21E6F0' : '#FF7A59'
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 22 }}
    >
      <motion.div
        className="flex flex-col items-center gap-1 mb-2"
        animate={isFirst ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {isFirst && <div className="text-5xl">👑</div>}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-5xl border-4"
          style={{ background: score.color + '33', borderColor: color }}
        >
          {score.emoji}
        </div>
        <div className="font-display font-bold text-xl">{score.name}{score.isYou && ' (you)'}</div>
        <div className="font-mono text-lemon">{score.score.toLocaleString()}</div>
      </motion.div>
      <div
        className="w-40 rounded-t-2xl border-4 border-ink flex items-center justify-center font-display font-bold text-5xl text-ink"
        style={{ height, background: color, boxShadow: `0 0 40px ${color}60` }}
      >
        {rank}
      </div>
    </motion.div>
  )
}
