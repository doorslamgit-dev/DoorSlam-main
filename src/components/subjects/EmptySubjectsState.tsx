import AppIcon from "../ui/AppIcon";

interface EmptySubjectsStateProps {
  onAddSubject: () => void;
}

export function EmptySubjectsState({ onAddSubject }: EmptySubjectsStateProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
        <AppIcon name="book" className="text-2xl text-primary-600 dark:text-primary-400" />
      </div>

      <h3 className="text-lg font-semibold text-primary-900 dark:text-neutral-100 mb-2">
        No subjects yet
      </h3>

      <p className="text-neutral-600 dark:text-neutral-300 mb-4">
        Add subjects to start tracking revision progress.
      </p>

      <button
        onClick={onAddSubject}
        className="px-6 py-2 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-colors inline-flex items-center"
      >
        <AppIcon name="plus" className="mr-2" />
        Add First Subject
      </button>
    </div>
  );
}
