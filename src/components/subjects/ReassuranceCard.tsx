// src/components/subjects/ReassuranceCard.tsx

import type { ChildInfo } from "../../types/subjectProgress";
import AppIcon from "../ui/AppIcon";

interface ReassuranceCardProps {
  child: ChildInfo;
  hasActiveSubjects: boolean;
  hasRevisitedTopics: boolean;
  hasUpcomingTopics: boolean;
}

export default function ReassuranceCard({
  child,
  hasActiveSubjects,
  hasRevisitedTopics,
  hasUpcomingTopics,
}: ReassuranceCardProps) {
  const checkItems = [
    {
      text: "All subjects have active revision sessions",
      checked: hasActiveSubjects,
    },
    {
      text: "Topics are being revisited when needed",
      checked: hasRevisitedTopics,
    },
    {
      text: "Future topics are scheduled and ready",
      checked: hasUpcomingTopics,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <AppIcon
            name="check-circle"
            className="w-6 h-6 text-green-600"
            aria-hidden
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Coverage is Happening
          </h3>
          <p className="text-sm text-gray-600">
            {child.child_name} is making steady progress across all subjects.
            Topics are being covered at a comfortable pace with regular review
            sessions.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {checkItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <AppIcon
              name="check"
              className={`w-4 h-4 ${
                item.checked ? "text-green-600" : "text-gray-300"
              }`}
              aria-hidden
            />
            <p className="text-sm text-gray-700">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
