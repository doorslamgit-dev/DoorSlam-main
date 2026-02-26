interface FormFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
}

export function FormField({
  label,
  value,
  onChange,
  disabled = false,
  type = "text",
  placeholder,
  hint,
}: FormFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block text-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed transition-colors ${
          disabled ? "bg-muted text-muted-foreground" : "bg-muted text-foreground"
        }`}
      />
      {hint && <p className="text-xs mt-1 text-muted-foreground">{hint}</p>}
    </div>
  );
}
