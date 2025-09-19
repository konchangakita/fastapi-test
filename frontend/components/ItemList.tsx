'use client';

import { useState } from 'react';
import { Item, ItemCreate } from '@/types';
import ItemCard from './ItemCard';
import EditItemModal from './EditItemModal';

interface ItemListProps {
  items: Item[];
  onUpdate: (id: number, item: ItemCreate) => void;
  onDelete: (id: number) => void;
}

export default function ItemList({ items, onUpdate, onDelete }: ItemListProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (id: number, updatedItem: ItemCreate) => {
    onUpdate(id, updatedItem);
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <p className="text-gray-500 text-lg">まだアイテムがありません</p>
        <p className="text-gray-400 text-sm">右側のフォームから新しいアイテムを追加してください</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
}
