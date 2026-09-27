import React from "react";
import { Check, X } from "lucide-react";

/**
 * Accessible on/off switch for settings rows.
 *
 * Keyboard and screen-reader behaviour come from the button element plus
 * role="switch", so it is a real control rather than a styled div.
 */
export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  onLabel = "On",
  offLabel = "Off",
  id,
}) {
  const handleClick = () => {
    if (!disabled) onChange?.(!checked);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-semibold text-foreground cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 shrink-0">
        {/* The word next to the switch, so the state is readable without
            having to interpret the knob position. */}
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            checked ? "text-green-600 dark:text-green-400" : "text-muted"
          }`}
        >
          {checked ? onLabel : offLabel}
        </span>

        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={handleClick}
          className={`relative w-14 h-8 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-[#0A1628] ${
            checked ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300 ${
              checked ? "translate-x-6" : "translate-x-0"
            }`}
          >
            {checked ? (
              <Check size={13} className="text-green-600" strokeWidth={3} />
            ) : (
              <X size={13} className="text-gray-400" strokeWidth={3} />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
