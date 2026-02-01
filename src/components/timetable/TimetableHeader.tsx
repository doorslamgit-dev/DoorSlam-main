import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import type { ChildOption } from "../../services/timetableService";

interface TimetableHeaderProps {
  children: ChildOption[];
  selectedChildId: string | null;
  onChildChange: (childId: string) => void;
}

export function TimetableHeader({
  children,
  selectedChildId,
  onChildChange,
}: TimetableHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-900">
          Revision Timetable
        </h1>
        <p className="text-neutral-600">Weekly schedule and session planning</p>
      </div>

      {/* Child Selector */}
      <div className="relative flex items-center px-4 py-2 rounded-full border cursor-pointer bg-primary-50 border-primary-100">
        <select
          value={selectedChildId || ""}
          onChange={(e) => onChildChange(e.target.value)}
          className="appearance-none bg-transparent border-none font-medium focus:outline-none cursor-pointer pr-6 text-primary-600"
        >
          {children.map((child) => (
            <option key={child.child_id} value={child.child_id}>
              {child.child_name}
            </option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="absolute right-4 text-xs pointer-events-none text-primary-600"
        />
      </div>
    </div>
  );
}
