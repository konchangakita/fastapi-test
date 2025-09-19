from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime

# FastAPIアプリケーションのインスタンスを作成
app = FastAPI(
    title="FastAPI Test API",
    description="FastAPIのテスト用API",
    version="1.0.0"
)

# CORS設定（テスト用 - 全オリジン許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # テスト用 - 全オリジン許可
    allow_credentials=False,  # ワイルドカード使用時はFalseに設定
    allow_methods=["*"],
    allow_headers=["*"],
)

# データモデル
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    created_at: Optional[datetime] = None

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

# メモリ内のデータストレージ（実際のプロダクションではデータベースを使用）
items_db = []
next_id = 1

@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {"message": "FastAPI Test API はじめました", "status": "running"}

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/items", response_model=List[Item])
async def get_items():
    """全アイテムを取得"""
    return items_db

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """特定のアイテムを取得"""
    for item in items_db:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="アイテムが見つかりません")

@app.post("/items", response_model=Item)
async def create_item(item: ItemCreate):
    """新しいアイテムを作成"""
    global next_id
    
    new_item = {
        "id": next_id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "created_at": datetime.now()
    }
    
    items_db.append(new_item)
    next_id += 1
    
    return new_item

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: ItemCreate):
    """アイテムを更新"""
    for i, existing_item in enumerate(items_db):
        if existing_item["id"] == item_id:
            updated_item = {
                "id": item_id,
                "name": item.name,
                "description": item.description,
                "price": item.price,
                "created_at": existing_item["created_at"]
            }
            items_db[i] = updated_item
            return updated_item
    
    raise HTTPException(status_code=404, detail="アイテムが見つかりません")

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """アイテムを削除"""
    for i, item in enumerate(items_db):
        if item["id"] == item_id:
            deleted_item = items_db.pop(i)
            return {"message": "アイテムが削除されました", "deleted_item": deleted_item}
    
    raise HTTPException(status_code=404, detail="アイテムが見つかりません")

@app.get("/stats")
async def get_stats():
    """統計情報を取得"""
    total_items = len(items_db)
    total_value = sum(item["price"] for item in items_db)
    
    return {
        "total_items": total_items,
        "total_value": total_value,
        "average_price": total_value / total_items if total_items > 0 else 0
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7776)
