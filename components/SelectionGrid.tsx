import React from "react";

type IdLike = string;
type Identifiable = { id: IdLike };

type SelectionGridProps<T extends Identifiable> = {
  title: string;
  subtitle?: string;
  items: T[];
  selectedId: IdLike | null;
  onSelect: (id: IdLike) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  className?: string;
  gridClassName?: string;
};

export default function SelectionGrid<T extends Identifiable>({
  title,
  subtitle,
  items,
  selectedId,
  onSelect,
  renderItem,
  className = "",
  gridClassName = "grid grid-cols-2 sm:grid-cols-5 gap-2",
}: SelectionGridProps<T>) {
  return (
    <section className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col">
        <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-brand-500 lowercase">{subtitle}</p>
        )}
      </div>

      <div className={gridClassName}>
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(item.id);
                }
              }}
            >
              {renderItem(item, isSelected)}
            </div>
          );
        })}
      </div>
    </section>
  );
}
