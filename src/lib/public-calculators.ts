export const calculators = [
  { path: '/attendance-calculator', title: 'College Attendance Calculator', description: 'Calculate your attendance percentage from attended and total classes, with a customizable minimum attendance target.', mode: 'attendance' },
  { path: '/75-percent-attendance-calculator', title: '75% Attendance Calculator', description: 'Check whether you meet the 75% college attendance requirement and calculate how many classes you need to attend.', mode: 'target' },
  { path: '/bunk-calculator', title: 'Bunk Calculator', description: 'Find how many upcoming classes you can miss without falling below your college attendance target.', mode: 'bunk' },
  { path: '/attendance-recovery-calculator', title: 'Attendance Recovery Calculator', description: 'Find how many consecutive classes you must attend to recover from an attendance shortage.', mode: 'recovery' },
] as const;
export type Calculator = typeof calculators[number];
