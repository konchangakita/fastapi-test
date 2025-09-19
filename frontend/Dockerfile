FROM node:18-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# ポート7777を公開
EXPOSE 7777

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
