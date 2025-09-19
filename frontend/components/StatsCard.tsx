'use client';

import { Stats } from '@/types';

interface StatsCardProps {
  stats: Stats | null;
}

export default function StatsCard({ stats }: StatsCardProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          統計情報
        </h2>
        <div className="text-center text-gray-500">
          データを読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        統計情報
      </h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-blue-600 font-medium">総アイテム数</p>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {stats.total_items}
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div>
            <p className="text-sm text-green-600 font-medium">総価値</p>
          </div>
          <div className="text-2xl font-bold text-green-700">
            ¥{stats.total_value.toLocaleString()}
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
          <div>
            <p className="text-sm text-purple-600 font-medium">平均価格</p>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            ¥{stats.average_price.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
