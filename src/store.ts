import { create } from 'zustand'
import { quiz } from './data/quiz'
import { fakePlayers, fakeScoreDelta } from './data/leaderboard'

export type Phase =
  | 'splash'
  | 'countdown'  // 3-2-1-GO before each question
  | 'playing'
  | 'reveal'     // show right answer + score pop
  | 'leaderboard'
  | 'podium'

export type Score = { id: string; name: string; emoji: string; color: string; score: number; lastDelta: number; isYou?: boolean }

type State = {
  phase: Phase
  index: number
  timeLeft: number          // seconds remaining on current question
  answered: boolean         // player has submitted their answer
  correct: boolean          // was the final submission correct
  playerDelta: number       // points scored this round
  scores: Score[]           // all players sorted by score desc
  paused: boolean           // set by a question to pause the countdown (e.g. for a tutorial)

  begin: () => void
  setPhase: (p: Phase) => void
  tickTime: (t: number) => void
  setPaused: (p: boolean) => void
  submitAnswer: (correct: boolean, opts?: { speedFactor?: number }) => void
  advance: () => void       // move from reveal → leaderboard → next countdown / podium
  reset: () => void

  total: () => number
  current: () => (typeof quiz)[number]
}

function initialScores(): Score[] {
  const you: Score = { id: 'you', name: 'You', emoji: '✨', color: '#FFE14A', score: 0, lastDelta: 0, isYou: true }
  const others: Score[] = fakePlayers.map(p => ({
    id: p.id, name: p.name, emoji: p.emoji, color: p.color, score: 0, lastDelta: 0
  }))
  return [you, ...others]
}

export const useGame = create<State>((set, get) => ({
  phase: 'splash',
  index: 0,
  timeLeft: 0,
  answered: false,
  correct: false,
  playerDelta: 0,
  scores: initialScores(),
  paused: false,

  begin: () => set({ phase: 'countdown', index: 0, scores: initialScores() }),

  setPhase: (p) => set({ phase: p, ...(p === 'playing' ? {
    timeLeft: get().current().time,
    answered: false,
    correct: false,
    playerDelta: 0,
    paused: false
  } : {}) }),

  tickTime: (t) => set({ timeLeft: Math.max(0, t) }),
  setPaused: (p) => set({ paused: p }),

  submitAnswer: (isCorrect, opts) => {
    if (get().answered) return
    const speedFactor = opts?.speedFactor ?? (get().timeLeft / get().current().time)
    // Score: 1000 max, 50% for correctness, 50% for speed
    const delta = isCorrect
      ? Math.round(500 + 500 * Math.max(0, Math.min(1, speedFactor)))
      : 0
    set({ answered: true, correct: isCorrect, playerDelta: delta })
  },

  advance: () => {
    const { phase, index, playerDelta } = get()
    const roundNum = index + 1

    if (phase === 'playing' || phase === 'reveal') {
      // Tally scores for everyone this round silently.
      const scores = get().scores.map(s => {
        if (s.isYou) {
          return { ...s, lastDelta: playerDelta, score: s.score + playerDelta }
        }
        const p = fakePlayers.find(fp => fp.id === s.id)!
        const delta = fakeScoreDelta(p, roundNum)
        return { ...s, lastDelta: delta, score: s.score + delta }
      })
      scores.sort((a, b) => b.score - a.score)

      const next = index + 1
      if (next >= quiz.length) {
        // End of quiz — show leaderboard once, at the end, then podium.
        set({ phase: 'leaderboard', scores })
      } else {
        // Skip straight to the next question.
        const q = quiz[next]
        set({
          phase: 'playing',
          scores,
          index: next,
          timeLeft: q.time,
          answered: false,
          correct: false,
          playerDelta: 0
        })
      }
      return
    }

    if (phase === 'leaderboard') {
      set({ phase: 'podium' })
      return
    }
  },

  reset: () => set({ phase: 'splash', index: 0, scores: initialScores() }),

  total: () => quiz.length,
  current: () => quiz[get().index]
}))

// dev helper
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as any).__game = useGame
  // Trace every store change for debugging — turn off by setting __trace = false
  ;(window as any).__trace = true
  let lastPhase: string | null = null
  let lastIndex = -1
  useGame.subscribe((s) => {
    if (!(window as any).__trace) return
    if (s.phase !== lastPhase || s.index !== lastIndex) {
      // eslint-disable-next-line no-console
      console.log(
        `%c[store] phase=${s.phase}  index=${s.index}  current=${s.current()?.id}`,
        'color:#21E6F0;font-weight:bold'
      )
      lastPhase = s.phase
      lastIndex = s.index
    }
  })
}
