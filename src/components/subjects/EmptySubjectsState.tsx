import AppIcon from "../ui/AppIcon";

interface EmptySubjectsStateProps {
  onAddSubject: () => void;
}

export function EmptySubjectsState({ onAddSubject }: EmptySubjectsStateProps) {
  return (
    <div className="bg-background rounded-2xl shadow-sm border border-border p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
        <AppIcon name="book" className="text-2xl text-primary dark:text-primary/70" />
      </div>

      <h3 className="text-lg font-semibold text-primary mb-2">
        No subjects yet
      </h3>

      <p className="text-muted-foreground mb-4">
        Add subjects to start tracking revision progress.
      </p>

      <button
        onClick={onAddSubject}
        className="px-6 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors inline-flex items-center"
      >
        <AppIcon name="plus" className="mr-2" />
        Add First Subject
      </button>
    </div>
  );
}
