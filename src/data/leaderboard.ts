// Fake opponents for the leaderboard. Scores are synthesized per round based on
// a personality: steady, spiky, late-bloomer, decliner. The player is always
// called "You" and their score is driven by the game.

export type FakePlayer = {
  id: string
  name: string
  emoji: string
  color: string
  personality: 'steady' | 'spiky' | 'late' | 'decliner'
}

export const fakePlayers: FakePlayer[] = [
  { id: 'p1', name: 'Zara',  emoji: '🦊', color: '#FF7A59', personality: 'steady' },
  { id: 'p2', name: 'Milo',  emoji: '🐻', color: '#FFE14A', personality: 'spiky' },
  { id: 'p3', name: 'Luna',  emoji: '🦉', color: '#59F3B1', personality: 'late' },
  { id: 'p4', name: 'Finn',  emoji: '🐙', color: '#21E6F0', personality: 'decliner' },
  { id: 'p5', name: 'Ivy',   emoji: '🦄', color: '#FF3DA8', personality: 'steady' },
  { id: 'p6', name: 'Rex',   emoji: '🦕', color: '#7B2CFF', personality: 'spiky' },
  { id: 'p7', name: 'Pip',   emoji: '🐧', color: '#C7DFE1', personality: 'late' }
]

// Deterministic per-round score delta for a fake player so the leaderboard is stable.
export function fakeScoreDelta(p: FakePlayer, round: number): number {
  const seed = hash(p.id + ':' + round)
  const r = seed / 0xffffffff
  const base = {
    steady:   700 + Math.floor(r * 260),
    spiky:    round % 2 === 0 ? 950 + Math.floor(r * 50) : 400 + Math.floor(r * 300),
    late:     round < 3 ? 500 + Math.floor(r * 200) : 850 + Math.floor(r * 140),
    decliner: round < 3 ? 900 + Math.floor(r * 100) : 500 + Math.floor(r * 250)
  }[p.personality]
  return base
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h
}
