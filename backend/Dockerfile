FROM python:3.11-slim

WORKDIR /app

# 依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルをコピー
COPY . .

# ポート7776を公開
EXPOSE 7776

# FastAPIアプリケーションを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7776", "--reload"]
