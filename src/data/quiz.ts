// Mixed trivia quiz. 6 rounds, one per unique question type.

export type MCQQuestion = {
  type: 'mcq'
  id: string
  prompt: string
  options: { id: string; label: string; correct: boolean }[]
  time: number
}

export type SwipeQuestion = {
  type: 'swipe'
  id: string
  prompt: string
  left: string  // label for left bucket
  right: string // label for right bucket
  cards: { id: string; text: string; side: 'left' | 'right' }[]
  time: number
}

export type DragQuestion = {
  type: 'drag'
  id: string
  prompt: string
  image: 'volcano' | 'solar' | 'body'
  // Each label must be placed on the matching zone.
  items: { id: string; label: string; zone: string }[]
  zones: { id: string; x: number; y: number; label: string }[] // %
  time: number
}

export type ReorderQuestion = {
  type: 'reorder'
  id: string
  prompt: string
  hint: string
  items: { id: string; label: string; order: number; icon: string }[]
  time: number
}

export type AimQuestion = {
  type: 'aim'
  id: string
  prompt: string
  // Targets spread across the top. Player drags-to-aim, release fires a projectile.
  targets: { id: string; label: string; correct: boolean }[]
  time: number
}

export type RhythmQuestion = {
  type: 'rhythm'
  id: string
  prompt: string
  // Tokens fall on 3 lanes. Player taps the lane when a CORRECT token hits the hit-line.
  // Wrong tokens should be avoided.
  tokens: { id: string; lane: 0 | 1 | 2; label: string; t: number; correct: boolean }[] // t = seconds into round
  time: number
}

export type SliderQuestion = {
  type: 'slider'
  id: string
  prompt: string
  min: number
  max: number
  target: number
  tolerance: number
  unit: string
  format?: 'int' | 'year'
  time: number
}

export type PinchQuestion = {
  type: 'pinch'
  id: string
  prompt: string
  // Real-world size of the object being scaled, in "units" (e.g. metres).
  realSize: number
  // Shown reference with a known size, e.g. human 1.7m.
  reference: { label: string; size: number; emoji: string }
  // Object to scale, with its emoji/shape and min/max allowed on-screen sizes.
  object: { label: string; emoji: string }
  // Tolerance as a fraction of realSize (e.g. 0.15 = ±15%).
  tolerance: number
  unit: string
  time: number
}

export type HotColdQuestion = {
  type: 'hotcold'
  id: string
  prompt: string
  // Target as a fraction of the playfield (0..1)
  target: { x: number; y: number }
  tolerance: number // fraction of the playfield considered "on target"
  time: number
  map: 'world' | 'body'
}

export type Question =
  | MCQQuestion | SwipeQuestion | DragQuestion | ReorderQuestion | AimQuestion | RhythmQuestion
  | SliderQuestion | PinchQuestion | HotColdQuestion

export const quiz: Question[] = [
  {
    type: 'mcq',
    id: 'q1',
    prompt: 'Which planet is the largest in our Solar System?',
    time: 15,
    options: [
      { id: 'a', label: 'Mars', correct: false },
      { id: 'b', label: 'Earth', correct: false },
      { id: 'c', label: 'Jupiter', correct: true },
      { id: 'd', label: 'Saturn', correct: false }
    ]
  },
  {
    type: 'rhythm',
    id: 'q2',
    prompt: 'Tap MULTIPLES OF 9 as they hit the box. Avoid the others!',
    time: 22,
    tokens: [
      { id: 'n1',  lane: 1, label: '9',  t: 2.0,  correct: true  },
      { id: 'n2',  lane: 0, label: '12', t: 3.0,  correct: false },
      { id: 'n3',  lane: 2, label: '18', t: 4.0,  correct: true  },
      { id: 'n4',  lane: 1, label: '15', t: 5.0,  correct: false },
      { id: 'n5',  lane: 0, label: '27', t: 6.0,  correct: true  },
      { id: 'n6',  lane: 2, label: '20', t: 7.0,  correct: false },
      { id: 'n7',  lane: 1, label: '36', t: 8.0,  correct: true  },
      { id: 'n8',  lane: 0, label: '40', t: 9.0,  correct: false },
      { id: 'n9',  lane: 2, label: '45', t: 10.0, correct: true  },
      { id: 'n10', lane: 1, label: '50', t: 11.0, correct: false },
      { id: 'n11', lane: 0, label: '54', t: 12.0, correct: true  },
      { id: 'n12', lane: 2, label: '24', t: 13.0, correct: false },
      { id: 'n13', lane: 1, label: '63', t: 14.0, correct: true  },
      { id: 'n14', lane: 0, label: '33', t: 15.0, correct: false },
      { id: 'n15', lane: 2, label: '72', t: 16.0, correct: true  },
      { id: 'n16', lane: 1, label: '49', t: 17.0, correct: false }
    ]
  },
  {
    type: 'drag',
    id: 'q3',
    prompt: 'Label the parts of the volcano.',
    image: 'volcano',
    time: 25,
    items: [
      { id: 'crater', label: 'Crater', zone: 'z-crater' },
      { id: 'magma',  label: 'Magma chamber', zone: 'z-magma' },
      { id: 'lava',   label: 'Lava flow', zone: 'z-lava' },
      { id: 'ash',    label: 'Ash cloud', zone: 'z-ash' }
    ],
    zones: [
      { id: 'z-ash',    x: 58, y: 16, label: 'Ash cloud' },
      { id: 'z-crater', x: 42, y: 46, label: 'Crater' },
      { id: 'z-lava',   x: 68, y: 64, label: 'Lava flow' },
      { id: 'z-magma',  x: 46, y: 84, label: 'Magma chamber' }
    ]
  },
  {
    type: 'reorder',
    id: 'q4',
    prompt: 'Put these historical events in the order they happened.',
    hint: 'Earliest first →',
    time: 25,
    items: [
      { id: 'pyramid', label: 'Great Pyramid built', order: 1, icon: '🏛️' },
      { id: 'rome',    label: 'Roman Empire founded', order: 2, icon: '🏺' },
      { id: 'america', label: 'Americas discovered', order: 3, icon: '⛵' },
      { id: 'moon',    label: 'First Moon landing',  order: 4, icon: '🚀' }
    ]
  },
  {
    type: 'slider',
    id: 'q5',
    prompt: 'In what year did humans first land on the Moon?',
    min: 1900,
    max: 2020,
    target: 1969,
    tolerance: 4,
    unit: '',
    format: 'year',
    time: 22
  },
  {
    type: 'pinch',
    id: 'q6',
    prompt: 'Size an adult African elephant next to the person.',
    realSize: 3, // shoulder height of an adult African elephant is ~3m
    reference: { label: 'Adult human', size: 1.7, emoji: '🧍' },
    object: { label: 'Adult African elephant', emoji: '🐘' },
    tolerance: 0.2, // ±20% — accepts 2.4m to 3.6m
    unit: 'm',
    time: 22
  },
  {
    type: 'hotcold',
    id: 'q7',
    prompt: 'Find Australia on the map!',
    target: { x: 0.83, y: 0.63 },
    tolerance: 0.1, // with the built-in +0.04 forgiveness, effective radius ~0.14 covers the continent
    time: 22,
    map: 'world'
  },
  {
    type: 'swipe',
    id: 'q8',
    prompt: 'Mammal or reptile? Swipe each animal.',
    left: 'Mammal',
    right: 'Reptile',
    time: 18,
    cards: [
      { id: 's1', text: 'Dolphin',   side: 'left' },
      { id: 's2', text: 'Crocodile', side: 'right' },
      { id: 's3', text: 'Kangaroo',  side: 'left' },
      { id: 's4', text: 'Iguana',    side: 'right' }
    ]
  }
]
