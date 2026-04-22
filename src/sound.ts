// Tiny web-audio SFX kit — no external assets. Each SFX is a short synth cue.

const Ctx = window.AudioContext || (window as any).webkitAudioContext
let ctx: AudioContext | null = null
function ac() {
  if (!ctx) ctx = new Ctx()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx!
}

type ToneOpts = { freq: number; dur: number; type?: OscillatorType; vol?: number; slide?: number }
function tone({ freq, dur, type = 'triangle', vol = 0.14, slide = 0 }: ToneOpts) {
  const a = ac()
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, a.currentTime)
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), a.currentTime + dur)
  g.gain.setValueAtTime(0.0001, a.currentTime)
  g.gain.exponentialRampToValueAtTime(vol, a.currentTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur)
  o.connect(g).connect(a.destination)
  o.start()
  o.stop(a.currentTime + dur)
}

function chord(freqs: number[], dur: number, type: OscillatorType = 'triangle', vol = 0.12) {
  freqs.forEach(f => tone({ freq: f, dur, type, vol }))
}

function noiseBurst(dur = 0.12, vol = 0.1) {
  const a = ac()
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = a.createBufferSource()
  src.buffer = buf
  const g = a.createGain()
  g.gain.value = vol
  src.connect(g).connect(a.destination)
  src.start()
}

let muted = false
export const setMuted = (m: boolean) => { muted = m }

export const sfx = {
  tap:       () => !muted && tone({ freq: 520,  dur: 0.09, type: 'square',   vol: 0.1  }),
  hover:     () => !muted && tone({ freq: 340,  dur: 0.05, type: 'sine',     vol: 0.05 }),
  correct:   () => !muted && chord([660, 880, 1320], 0.28, 'triangle', 0.13),
  wrong:     () => !muted && tone({ freq: 180,  dur: 0.25, type: 'sawtooth', vol: 0.1, slide: -80 }),
  countdown: () => !muted && tone({ freq: 440,  dur: 0.12, type: 'square',   vol: 0.09 }),
  go:        () => !muted && chord([523, 784, 1046], 0.32, 'triangle', 0.15),
  whoosh:    () => !muted && noiseBurst(0.18, 0.08),
  pop:       () => !muted && tone({ freq: 900,  dur: 0.06, type: 'square',   vol: 0.08 }),
  climb:     (n: number) => !muted && tone({ freq: 440 + n * 80, dur: 0.12, type: 'square', vol: 0.1 }),
  cheer:     () => !muted && chord([523, 659, 784, 1046], 0.42, 'triangle', 0.14)
}
