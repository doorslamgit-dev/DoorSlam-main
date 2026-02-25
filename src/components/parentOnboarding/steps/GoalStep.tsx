// src/components/parentOnboarding/steps/GoalStep.tsx

import { useEffect, useState } from "react";
import AppIcon from "../../ui/AppIcon";
import {
  listGoals,
  type Goal,
} from "../../../services/referenceData/referenceDataService";

const fallbackGoals: Goal[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    code: "pass_exam",
    name: "Pass the exam",
    description: "Focus on coverage and confidence.",
    sort_order: 100,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    code: "improve_grade",
    name: "Improve the grade",
    description: "Target weaker areas and practise exam style.",
    sort_order: 200,
  },
];

// Map goal codes to AppIcon keys (Lucide registry)
const GOAL_ICONS: Record<string, string> = {
  top_grades: "trophy",
  feel_confident: "heart",
  understand_topics: "lightbulb",
  stay_organised: "calendar-check",
  pass_exam: "check-circle",
  improve_grade: "trending-up",
  just_pass: "check-circle",
  // Default fallback
  default: "target",
};

function getGoalIconKey(code: string): string {
  return GOAL_ICONS[code] ?? GOAL_ICONS.default;
}

export default function GoalStep(props: {
  value?: string;
  onChange: (goalCode: string) => void;
}) {
  const { value, onChange } = props;
  const [goals, setGoals] = useState<Goal[]>(fallbackGoals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listGoals();
        if (mounted && data.length > 0) setGoals(data);
      } catch {
        /* fallback stays */
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Section header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          What's the goal?
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Choose the main focus for your child's revision. You can change this later.
        </p>
      </div>

      {/* Goal options */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="ml-3 text-sm text-muted-foreground">Loading goals…</span>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((g) => {
            const selected = value === g.code;
            const iconKey = getGoalIconKey(g.code);

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onChange(g.code)}
                className={`w-full border-2 rounded-xl p-5 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/20 hover:shadow-soft"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mt-0.5">
                    <AppIcon
                      name={iconKey}
                      className="w-5 h-5 text-primary"
                      aria-hidden
                    />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {g.name}
                    </h3>
                    {g.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {g.description}
                      </p>
                    )}
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                      selected ? "border-primary" : "border-input"
                    }`}
                    aria-hidden
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-primary transition-opacity ${
                        selected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
