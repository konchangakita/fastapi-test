'use client';

import { useState, useEffect } from 'react';
import { Item, ItemCreate, Stats } from '@/types';
import { itemApi, statsApi, healthApi } from '@/lib/api';
import ItemList from '@/components/ItemList';
import ItemForm from '@/components/ItemForm';
import StatsCard from '@/components/StatsCard';
import HealthStatus from '@/components/HealthStatus';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<{ status: string; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データを読み込む
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [itemsData, statsData, healthData] = await Promise.all([
        itemApi.getItems(),
        statsApi.getStats(),
        healthApi.checkHealth()
      ]);
      
      setItems(itemsData);
      setStats(statsData);
      setHealth(healthData);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // アイテムを作成
  const handleCreateItem = async (itemData: ItemCreate) => {
    try {
      const newItem = await itemApi.createItem(itemData);
      setItems([...items, newItem]);
      loadData(); // 統計を更新
    } catch (err) {
      setError('アイテムの作成に失敗しました');
      console.error('Error creating item:', err);
    }
  };

  // アイテムを更新
  const handleUpdateItem = async (id: number, itemData: ItemCreate) => {
    try {
      const updatedItem = await itemApi.updateItem(id, itemData);
      setItems(items.map(item => item.id === id ? updatedItem : item));
      loadData(); // 統計を更新
    } catch (err) {
      setError('アイテムの更新に失敗しました');
      console.error('Error updating item:', err);
    }
  };

  // アイテムを削除
  const handleDeleteItem = async (id: number) => {
    try {
      await itemApi.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
      loadData(); // 統計を更新
    } catch (err) {
      setError('アイテムの削除に失敗しました');
      console.error('Error deleting item:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FastAPI Test アプリケーション
          </h1>
          <p className="text-gray-600">
            FastAPIとNext.jsを使ったシンプルなCRUDアプリケーション
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: アイテム一覧 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                アイテム一覧
              </h2>
              <ItemList
                items={items}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
              />
            </div>
          </div>

          {/* 右側: フォームと統計 */}
          <div className="space-y-6">
            {/* ヘルスステータス */}
            <HealthStatus health={health} />

            {/* 統計情報 */}
            <StatsCard stats={stats} />

            {/* アイテム作成フォーム */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                新しいアイテムを追加
              </h2>
              <ItemForm onSubmit={handleCreateItem} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
