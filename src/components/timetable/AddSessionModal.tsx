// src/components/timetable/AddSessionModal.tsx

import { useState, useEffect } from "react";
import Alert from "../ui/Alert";
import AppIcon from "../ui/AppIcon";
import Modal from "../ui/Modal";
import {
  fetchChildSubjects,
  addSingleSession,
  type ChildSubjectOption,
} from "../../services/timetableService";
import { TIME_SLOT_LABELS, TIME_SLOT_ORDER } from "../../utils/timetableUtils";

type ModalMode = "choice" | "single" | "recurring";

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  selectedDate?: Date;
  onSessionAdded: () => void;
  onEditSchedule: () => void;
}

export default function AddSessionModal({
  isOpen,
  onClose,
  childId,
  selectedDate,
  onSessionAdded,
  onEditSchedule,
}: AddSessionModalProps) {
  const [mode, setMode] = useState<ModalMode>("choice");
  const [subjects, setSubjects] = useState<ChildSubjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for single session
  const [formData, setFormData] = useState({
    date: selectedDate ? formatDate(selectedDate) : formatDate(new Date()),
    subjectId: "",
    sessionPattern: "DOUBLE_45",
    timeOfDay: "afternoon" as string,
  });

  useEffect(() => {
    if (isOpen && childId) {
      loadSubjects();
      setMode("choice");
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on modal open only
  }, [isOpen, childId]);

  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: formatDate(selectedDate),
      }));
    }
  }, [selectedDate]);

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  async function loadSubjects() {
    setLoading(true);
    const { data, error } = await fetchChildSubjects(childId);
    if (data) {
      setSubjects(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, subjectId: data[0].subject_id }));
      }
    }
    if (error) setError(error);
    setLoading(false);
  }

  async function handleAddSession() {
    if (!formData.subjectId || !formData.date) {
      setError("Please select a subject and date");
      return;
    }

    setSaving(true);
    setError(null);

    const durationMap: Record<string, number> = {
      SINGLE_20: 20,
      DOUBLE_45: 45,
      TRIPLE_70: 70,
    };

    const { success, error } = await addSingleSession({
      childId,
      planId: null,
      sessionDate: formData.date,
      subjectId: formData.subjectId,
      sessionPattern: formData.sessionPattern,
      sessionDurationMinutes: durationMap[formData.sessionPattern] || 45,
      timeOfDay: formData.timeOfDay,
    });

    setSaving(false);

    if (success) {
      onSessionAdded();
      onClose();
    } else {
      setError(error || "Failed to add session");
    }
  }

  function handleEditSchedule() {
    onClose();
    onEditSchedule();
  }

  const modalTitle =
    mode === "choice"
      ? "Add Revision Session"
      : mode === "single"
        ? "Quick Add Session"
        : "Edit Schedule";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={
        mode === "single" ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMode("choice")}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition"
            >
              Back
            </button>
            <button
              onClick={handleAddSession}
              disabled={saving || loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <AppIcon name="plus" className="w-4 h-4" />
                  Add Session
                </>
              )}
            </button>
          </div>
        ) : undefined
      }
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Choice Mode */}
      {mode === "choice" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            How would you like to add sessions?
          </p>

          <button
            onClick={() => setMode("single")}
            className="w-full p-4 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition">
                <AppIcon name="plus" className="text-primary w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">One-time session</h3>
                <p className="text-sm text-muted-foreground">
                  Add a single session for a specific date
                </p>
              </div>
              <AppIcon name="arrow-right" className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
            </div>
          </button>

          <button
            onClick={handleEditSchedule}
            className="w-full p-4 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition">
                <AppIcon name="calendar" className="text-primary w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Change weekly schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Edit recurring availability pattern
                </p>
              </div>
              <AppIcon name="arrow-right" className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
            </div>
          </button>
        </div>
      )}

      {/* Single Session Form */}
      {mode === "single" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading subjects...</p>
            </div>
          ) : (
            <>
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  min={formatDate(new Date())}
                  className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Time Slot
                </label>
                <select
                  value={formData.timeOfDay}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, timeOfDay: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {TIME_SLOT_ORDER.map((slot) => (
                    <option key={slot} value={slot}>
                      {TIME_SLOT_LABELS[slot]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Subject
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subjectId: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {subjects.map((subject) => (
                    <option key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Pattern */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Session Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "SINGLE_20", label: "20 min", desc: "Quick" },
                    { value: "DOUBLE_45", label: "45 min", desc: "Standard" },
                    { value: "TRIPLE_70", label: "70 min", desc: "Extended" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          sessionPattern: option.value,
                        }))
                      }
                      className={`p-3 border-2 rounded-lg text-center transition ${
                        formData.sessionPattern === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-input"
                      }`}
                    >
                      <div className={`font-semibold ${
                        formData.sessionPattern === option.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
