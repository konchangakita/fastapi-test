'use client';

import { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const handleDelete = () => {
    if (window.confirm(`「${item.name}」を削除しますか？`)) {
      onDelete(item.id!);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-gray-600 mb-3">{item.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              ¥{item.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400">
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
