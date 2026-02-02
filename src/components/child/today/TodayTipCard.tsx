// src/components/child/today/TodayTipCard.tsx
// Today's Tip section

import AppIcon from "../../ui/AppIcon";

// Tips pool - could be expanded or fetched from backend
const TIPS = [
  "Try the Feynman Technique: explain what you've learned in simple terms. If you struggle, you know where to focus your revision!",
  "Take a 5-minute break between sessions. A quick walk or stretch helps your brain absorb information better.",
  "Use active recall: close your notes and try to remember key points before checking. This strengthens memory!",
  "Spaced repetition works! Reviewing topics over several days is more effective than cramming.",
  "Stay hydrated! Your brain works better when you're well-hydrated.",
  "Teaching someone else (even an imaginary student) helps you understand topics more deeply.",
  "Don't just re-read notes - test yourself with practice questions for better results.",
  "Break difficult topics into smaller chunks. Master one part before moving to the next.",
];

export default function TodayTipCard() {
  // Select tip based on day of year for consistency within a day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const tipIndex = dayOfYear % TIPS.length;
  const tip = TIPS[tipIndex];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card p-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <AppIcon name="lightbulb" className="text-primary-600 dark:text-primary-400 w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-primary-900 dark:text-neutral-100 mb-2">Today's Tip</h3>
          <p className="text-neutral-600 dark:text-neutral-300">{tip}</p>
        </div>
      </div>
    </div>
  );
}