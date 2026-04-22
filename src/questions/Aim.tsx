import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { AimQuestion } from '../data/quiz'
import { sfx } from '../sound'

type Projectile = { id: number; x: number; y: number; vx: number; vy: number; alive: boolean }

/**
 * Aim & fire: drag from the cannon to set angle + power, release to launch.
 * The projectile arcs with gravity; when it hits a target, we resolve.
 */
export function Aim({ q, onFinish }: { q: AimQuestion; onFinish: (correct: boolean) => void }) {
  const [projectile, setProjectile] = useState<Projectile | null>(null)
  const [result, setResult] = useState<{ id: string; correct: boolean } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [hitIndex, setHitIndex] = useState<number | null>(null)
  const joystickX = useMotionValue(0)
  const joystickY = useMotionValue(0)
  const angle = useTransform([joystickX, joystickY], ([x, y]) => {
    const n = x as number, m = y as number
    return Math.atan2(m, n) * (180 / Math.PI)
  })
  const cannonW = 900
  const cannonH = 520
  const cannonX = cannonW / 2
  const cannonY = cannonH - 40

  function launch() {
    if (result || projectile) return
    const dx = joystickX.get()
    const dy = joystickY.get()
    const mag = Math.hypot(dx, dy)
    if (mag < 10) return
    sfx.whoosh()
    // Flip y so dragging up shoots up
    const power = Math.min(1, mag / 140)
    const speed = 900 * power
    const rad = Math.atan2(-dy, dx) // invert y
    const vx = Math.cos(rad) * speed
    const vy = -Math.sin(rad) * speed
    setProjectile({ id: Date.now(), x: cannonX, y: cannonY - 30, vx, vy, alive: true })
    joystickX.set(0); joystickY.set(0)
  }

  // Physics loop for the projectile
  useEffect(() => {
    if (!projectile) return
    let raf = 0
    let last = performance.now()
    const g = 1600 // gravity px/s²
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const p = projectile
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += g * dt
      setProjectile({ ...p })

      // Check targets (screen space of stage)
      const stage = stageRef.current?.getBoundingClientRect()
      if (stage) {
        // Convert projectile local coords (0..cannonW, 0..cannonH) to fraction
        const px = (p.x / cannonW)
        const py = (p.y / cannonH)
        for (let i = 0; i < q.targets.length; i++) {
          const tx = (i + 1) / (q.targets.length + 1)
          const ty = 0.22
          const d = Math.hypot((px - tx) * cannonW, (py - ty) * cannonH)
          if (d < 58) {
            sfx.pop()
            setHitIndex(i)
            setResult({ id: q.targets[i].id, correct: q.targets[i].correct })
            setTimeout(() => onFinish(q.targets[i].correct), 900)
            return
          }
        }
      }

      if (p.y > cannonH + 40 || p.x < -40 || p.x > cannonW + 40) {
        // Missed
        sfx.wrong()
        onFinish(false)
        setResult({ id: 'miss', correct: false })
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [projectile?.id])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
      <motion.h2 className="title text-3xl md:text-5xl text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {q.prompt}
      </motion.h2>

      <div
        ref={stageRef}
        className="relative rounded-3xl border-4 border-ink overflow-hidden shadow-pop"
        style={{ width: cannonW, height: cannonH, background: 'linear-gradient(180deg,#3A4C6B 0%, #7B2CFF 60%, #141028 100%)' }}
      >
        {/* stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: (i%5)+1, height: (i%5)+1,
            left: `${(i*73)%100}%`, top: `${(i*41)%70}%`, opacity: 0.5 + (i%3)*0.15
          }} />
        ))}

        {/* targets */}
        {q.targets.map((t, i) => {
          const tx = ((i + 1) / (q.targets.length + 1)) * 100
          const isHit = hitIndex === i
          return (
            <motion.div
              key={t.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${tx}%`, top: '22%' }}
              animate={{ y: isHit ? [0, -30] : [0, -6, 0], scale: isHit ? [1, 1.4, 0] : 1 }}
              transition={{ duration: isHit ? 0.8 : 3 + i * 0.4, repeat: isHit ? 0 : Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center font-display font-bold text-ink border-4 border-ink shadow-pop"
                style={{
                  background: ['#FFE14A','#FF3DA8','#21E6F0','#59F3B1'][i % 4],
                  color: '#0B0B18'
                }}
              >
                <div className="text-center leading-tight px-2 text-lg">{t.label}</div>
              </div>
            </motion.div>
          )
        })}

        {/* projectile */}
        {projectile && (
          <motion.div
            className="absolute w-6 h-6 rounded-full bg-lemon"
            style={{ left: projectile.x - 12, top: projectile.y - 12, boxShadow: '0 0 18px #FFE14A' }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              style={{ boxShadow: '0 0 28px #FFE14A' }}
            />
          </motion.div>
        )}

        {/* cannon */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 20 }}>
          <motion.div className="relative" style={{ rotate: angle }}>
            <div className="w-16 h-6 rounded-full bg-white border-4 border-ink" style={{ transformOrigin: '0% 50%' }} />
          </motion.div>
          <div className="w-24 h-16 rounded-t-[40px] bg-coral border-4 border-ink mt-[-8px] flex items-end justify-center pb-2 text-ink font-display font-bold">🔫</div>
        </div>

        {/* Aim joystick */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[100px] w-32 h-32 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
          <motion.div
            className="w-14 h-14 rounded-full bg-lemon border-4 border-ink cursor-grab active:cursor-grabbing"
            drag
            dragConstraints={{ left: -60, right: 60, top: -60, bottom: 60 }}
            dragSnapToOrigin
            style={{ x: joystickX, y: joystickY }}
            onDragEnd={() => launch()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1.1 }}
          />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 text-xs font-mono tracking-widest text-white/70">DRAG · RELEASE TO FIRE</div>
      </div>
    </div>
  )
}
