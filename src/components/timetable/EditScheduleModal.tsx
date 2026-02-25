// src/components/timetable/EditScheduleModal.tsx

import { useState, useEffect } from "react";
import Alert from "../ui/Alert";
import AppIcon from "../ui/AppIcon";
import Modal from "../ui/Modal";
import WeeklyScheduleEditor from "../shared/scheduling/WeeklyScheduleEditor";
import { createEmptyTemplate, type DayTemplate } from "../shared/scheduling/DayCard";
import {
  fetchWeeklyTemplate,
  saveWeeklyTemplate,
  saveTemplateAndRegenerate,
} from "../../services/timetableService";

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName: string;
  onScheduleUpdated: () => void;
}

type SaveMode = "template_only" | "regenerate";

export default function EditScheduleModal({
  isOpen,
  onClose,
  childId,
  childName,
  onScheduleUpdated,
}: EditScheduleModalProps) {
  const [template, setTemplate] = useState<DayTemplate[]>(createEmptyTemplate());
  const [originalTemplate, setOriginalTemplate] = useState<DayTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  useEffect(() => {
    if (isOpen && childId) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on modal open only
  }, [isOpen, childId]);

  async function loadTemplate() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await fetchWeeklyTemplate(childId);

      if (error) {
        setError(error);
        const defaultTemplate = createEmptyTemplate();
        setTemplate(defaultTemplate);
        setOriginalTemplate(JSON.parse(JSON.stringify(defaultTemplate)));
      } else if (data) {
        setTemplate(data);
        setOriginalTemplate(JSON.parse(JSON.stringify(data)));
      } else {
        const defaultTemplate = createEmptyTemplate();
        setTemplate(defaultTemplate);
        setOriginalTemplate(JSON.parse(JSON.stringify(defaultTemplate)));
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Failed to load schedule"));
      const defaultTemplate = createEmptyTemplate();
      setTemplate(defaultTemplate);
      setOriginalTemplate(JSON.parse(JSON.stringify(defaultTemplate)));
    } finally {
      setLoading(false);
    }
  }

  const hasChanges = JSON.stringify(template) !== JSON.stringify(originalTemplate);
  const isValid = template.some((day) => day.is_enabled && day.slots.length > 0);

  const weeklyStats = template.reduce(
    (acc, day) => {
      if (!day.is_enabled) return acc;
      day.slots.forEach((slot) => {
        acc.sessions += 1;
        acc.minutes += slot.session_pattern === "p20" ? 20 : slot.session_pattern === "p70" ? 70 : 45;
      });
      return acc;
    },
    { sessions: 0, minutes: 0 }
  );

  async function handleSave(mode: SaveMode) {
    setSaving(true);
    setError(null);

    try {
      const result =
        mode === "regenerate"
          ? await saveTemplateAndRegenerate(childId, template)
          : await saveWeeklyTemplate(childId, template);

      if (result.success) {
        setOriginalTemplate(JSON.parse(JSON.stringify(template)));
        setShowSaveOptions(false);
        onScheduleUpdated();
        onClose();
      } else {
        setError(result.error || "Failed to save schedule");
        setShowSaveOptions(false);
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "An error occurred"));
      setShowSaveOptions(false);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to close?")) {
        return;
      }
    }
    onClose();
  }

  const footerContent = saving ? (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-3 text-primary">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-medium">Saving schedule...</span>
      </div>
    </div>
  ) : showSaveOptions ? (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">
        How would you like to save?
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSave("template_only")}
          disabled={saving}
          className="p-3 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition text-left group disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary group-hover:bg-primary/10 rounded-lg flex items-center justify-center transition">
              <AppIcon name="save" className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Save template only</h4>
              <p className="text-xs text-muted-foreground">Existing sessions unchanged</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleSave("regenerate")}
          disabled={saving}
          className="p-3 border-2 border-primary/20 bg-primary/5 rounded-xl hover:border-primary/50 hover:bg-primary/10 transition text-left group disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition">
              <AppIcon name="rotate-cw" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary">Save & regenerate</h4>
              <p className="text-xs text-primary">Update future sessions</p>
            </div>
          </div>
        </button>
      </div>
      <button
        onClick={() => setShowSaveOptions(false)}
        disabled={saving}
        className="w-full text-sm text-muted-foreground hover:text-foreground py-2 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {weeklyStats.sessions} sessions/week · {weeklyStats.minutes} mins/week
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition"
        >
          Cancel
        </button>
        <button
          onClick={() => setShowSaveOptions(true)}
          disabled={!isValid || !hasChanges || saving}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <AppIcon name="save" className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Weekly Schedule"
      subtitle={`${childName}'s revision timetable`}
      maxWidth="2xl"
      footer={footerContent}
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading schedule...</p>
        </div>
      ) : (
        <WeeklyScheduleEditor
          template={template}
          onChange={setTemplate}
          showSummary={true}
          compact={true}
        />
      )}
    </Modal>
  );
}
