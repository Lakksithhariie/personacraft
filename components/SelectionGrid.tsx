import React from 'react';

interface SelectionGridProps<T> {
  title: string;
  subtitle: string;
  items: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
}

const SelectionGrid = <T extends { id: string },>({
  title,
  subtitle,
  items,
  selectedId,
  onSelect,
  renderItem
}: SelectionGridProps<T>) => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">{title}</h2>
        <p className="text-xs text-brand-500 lowercase">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {items.map((item) => (
          <div key={item.id} onClick={() => onSelect(item.id)}>
            {renderItem(item, selectedId === item.id)}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SelectionGrid;
