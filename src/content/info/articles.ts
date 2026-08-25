export const infoArticles = {
  'workout-101': {
    title: 'Workout 101',
    summary: 'Sets, reps, rest, and progressive overload basics.',
    sections: [
      {
        heading: 'What is a workout?',
        body: 'A workout is a structured session where you perform exercises in sets and reps. Each set is a group of consecutive repetitions followed by rest.',
      },
      {
        heading: 'Sets and reps',
        body: 'Reps (repetitions) are how many times you perform a movement in one set. Sets are how many times you repeat that group. Example: 3 sets of 8 reps = 3 × 8.',
      },
      {
        heading: 'Rest periods',
        body: 'Rest between sets allows recovery. Compound lifts (squat, deadlift, bench) typically need 2–3 minutes. Isolation work often needs 60–90 seconds.',
      },
      {
        heading: 'Progressive overload',
        body: 'To get stronger, gradually increase demand: add weight, add reps, add sets, or reduce rest. Track your workouts so you know when to progress.',
      },
    ],
  },
  'movements-101': {
    title: 'Movements 101',
    summary: 'Compound vs isolation and movement categories.',
    sections: [
      {
        heading: 'Compound movements',
        body: 'Multi-joint exercises that train several muscle groups at once. Examples: squat, deadlift, bench press, row, overhead press. Build these into every program.',
      },
      {
        heading: 'Isolation movements',
        body: 'Single-joint exercises targeting one muscle. Examples: bicep curl, leg extension, lateral raise. Use these to bring up weak points.',
      },
      {
        heading: 'Movement patterns',
        body: 'Push (bench, press), pull (row, pulldown), squat/hinge (squat, deadlift), and carry/core. A balanced program covers all patterns across the week.',
      },
      {
        heading: 'Form first',
        body: 'Always prioritize controlled movement over heavy weight. Full range of motion, stable core, and consistent tempo beat ego lifting every time.',
      },
    ],
  },
  'anatomy-101': {
    title: 'Anatomy 101',
    summary: 'Major muscle groups and how they work together.',
    sections: [
      {
        heading: 'Upper body push',
        body: 'Chest, front deltoids, and triceps drive pressing movements like bench press and overhead press.',
      },
      {
        heading: 'Upper body pull',
        body: 'Back (lats, traps, rhomboids) and biceps handle rows, pull-ups, and pulldowns.',
      },
      {
        heading: 'Lower body',
        body: 'Quads extend the knee (squat, leg press). Hamstrings and glutes extend the hip (deadlift, hip thrust). Calves plantarflex the ankle.',
      },
      {
        heading: 'Core',
        body: 'Abs, obliques, and deep stabilizers transfer force between upper and lower body. Every compound lift trains core to some degree.',
      },
    ],
  },
  'training-insight': {
    title: 'Training Insight',
    summary: 'RIR, periodization, and recovery principles.',
    sections: [
      {
        heading: 'Reps In Reserve (RIR)',
        body: 'RIR is how many more reps you could have done before failure. RIR 0 = failure. RIR 2 = two reps left in the tank. Most training stays in the 1–3 RIR range for strength and hypertrophy.',
      },
      {
        heading: 'Periodization',
        body: 'Vary volume and intensity across weeks. Hard weeks followed by lighter deload weeks prevent burnout and drive long-term progress.',
      },
      {
        heading: 'Recovery',
        body: 'Muscle grows during rest, not during training. Sleep 7–9 hours, eat enough protein (1.6–2.2 g/kg), and manage stress.',
      },
      {
        heading: 'Tracking matters',
        body: 'Log weight, reps, and RIR every session. Trends in volume, intensity, and estimated 1RM tell you whether your program is working.',
      },
    ],
  },
} as const

export type InfoArticleSlug = keyof typeof infoArticles
