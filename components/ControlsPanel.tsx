import React from "react";
import { RewriteSettings } from "../types";

type Props = {
  value: RewriteSettings;
  onChange: (next: RewriteSettings) => void;
  disabled?: boolean;
};

function set<K extends keyof RewriteSettings>(
  value: RewriteSettings,
  key: K,
  nextValue: RewriteSettings[K]
): RewriteSettings {
  return { ...value, [key]: nextValue };
}

const ControlsPanel: React.FC<Props> = ({ value, onChange, disabled }) => {
  const buttonBase =
    "px-3 py-2 border-2 text-xs font-semibold lowercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const onCls =
    "bg-brand-200 border-brand-500 ring-2 ring-brand-500 ring-offset-2 text-brand-900";
  const offCls =
    "bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300 text-brand-700";

  const ToggleGroup = ({
    title,
    subtitle,
    options,
    current,
    onSelect,
  }: {
    title: string;
    subtitle?: string;
    options: { id: string; label: string }[];
    current: string;
    onSelect: (id: string) => void;
  }) => {
    return (
      <section className="flex flex-col gap-2">
        <div className="flex flex-col">
          <h3 className="text-xs font-semibold text-brand-900 lowercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-brand-500 lowercase">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const selected = opt.id === current;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(opt.id)}
                className={`${buttonBase} ${selected ? onCls : offCls}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <section className="flex flex-col gap-5 p-6 bg-white/60 border-2 border-brand-200">
      <div className="flex flex-col">
        <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">
          sidekick controls
        </h2>
        <p className="text-xs text-brand-500 lowercase">
          optional constraints for tense, pov, structure, and emphasis
        </p>
      </div>

      <ToggleGroup
        title="tense"
        subtitle="keep as-is unless you need a consistent tense"
        current={value.tense}
        onSelect={(id) => onChange(set(value, "tense", id as any))}
        options={[
          { id: "as_is", label: "as-is" },
          { id: "present", label: "present" },
          { id: "past", label: "past" },
        ]}
      />

      <ToggleGroup
        title="point of view"
        subtitle="useful for bios, case studies, and narratives"
        current={value.pov}
        onSelect={(id) => onChange(set(value, "pov", id as any))}
        options={[
          { id: "as_is", label: "as-is" },
          { id: "first", label: "first person" },
          { id: "third", label: "third person" },
        ]}
      />

      <ToggleGroup
        title="length"
        subtitle="helps keep outputs consistent across variations"
        current={value.length}
        onSelect={(id) => onChange(set(value, "length", id as any))}
        options={[
          { id: "shorter", label: "shorter" },
          { id: "same", label: "same" },
          { id: "longer", label: "longer" },
        ]}
      />

      <ToggleGroup
        title="transitions"
        subtitle="make flow smoother (without adding fluff)"
        current={value.transitions}
        onSelect={(id) => onChange(set(value, "transitions", id as any))}
        options={[
          { id: "off", label: "off" },
          { id: "light", label: "light" },
          { id: "strong", label: "strong" },
        ]}
      />

      <ToggleGroup
        title="vividness"
        subtitle="emotion via specificity (keep it tasteful)"
        current={value.vividness}
        onSelect={(id) => onChange(set(value, "vividness", id as any))}
        options={[
          { id: "low", label: "low" },
          { id: "balanced", label: "balanced" },
          { id: "high", label: "high" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-xs font-semibold text-brand-900 lowercase tracking-wider">
            summary
          </h3>
          <p className="text-[11px] text-brand-500 lowercase">
            add a 1–2 sentence summary under the rewrite
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(set(value, "includeSummary", !value.includeSummary))}
          className={`${buttonBase} ${value.includeSummary ? onCls : offCls}`}
        >
          {value.includeSummary ? "on" : "off"}
        </button>
      </div>
    </section>
  );
};

export default ControlsPanel;
