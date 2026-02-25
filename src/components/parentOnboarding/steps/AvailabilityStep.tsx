// src/components/parentOnboarding/steps/AvailabilityStep.tsx

export type SessionPattern = "p20" | "p45" | "p70";

export type Availability = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  { sessions: number; session_pattern: SessionPattern }
>;

const days: Array<{ key: keyof Availability; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const patternLabels: Record<SessionPattern, string> = {
  p20: "20 mins (1 topic)",
  p45: "45 mins (2 topics)",
  p70: "70 mins (3 topics)",
};

export default function AvailabilityStep(props: {
  value: Availability;
  onChange: (next: Availability) => void;
}) {
  const { value, onChange } = props;

  function setDay<K extends keyof Availability>(day: K, next: Availability[K]) {
    onChange({ ...value, [day]: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">When can they study?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set a pattern that fits family life. You can change this later.
        </p>
      </div>

      <div className="space-y-3">
        {days.map((d) => {
          const v = value[d.key];
          return (
            <div
              key={d.key}
              className="rounded-2xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="min-w-[140px]">
                <p className="font-medium text-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {v.sessions === 0 ? "No sessions" : `${v.sessions} session${v.sessions === 1 ? "" : "s"}`}
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:justify-end">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-foreground">Sessions</label>
                  <select
                    value={String(v.sessions)}
                    onChange={(e) =>
                      setDay(d.key, { ...v, sessions: Number(e.target.value) })
                    }
                    className="rounded-xl border border-input px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-foreground">Length</label>
                  <select
                    value={v.session_pattern}
                    onChange={(e) =>
                      setDay(d.key, { ...v, session_pattern: e.target.value as SessionPattern })
                    }
                    className="rounded-xl border border-input px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    disabled={v.sessions === 0}
                  >
                    {Object.keys(patternLabels).map((k) => (
                      <option key={k} value={k}>
                        {patternLabels[k as SessionPattern]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
        Tip: start light. Consistency beats intensity.
      </div>
    </div>
  );
}
