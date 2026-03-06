// src/components/subjects/SubjectActionCards.tsx

import Button from "../ui/Button";

interface SubjectActionCardsProps {
  onAddSubject: () => void;
  onDeleteSubject: () => void;
}

export default function SubjectActionCards({
  onAddSubject,
  onDeleteSubject,
}: SubjectActionCardsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        leftIcon="plus-circle"
        onClick={onAddSubject}
      >
        Add Subject
      </Button>
      <Button
        variant="secondary"
        size="sm"
        leftIcon="trash"
        onClick={onDeleteSubject}
      >
        Delete Subject
      </Button>
    </div>
  );
}
