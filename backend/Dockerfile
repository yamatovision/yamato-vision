# ベースイメージ
FROM node:18-slim

# OpenSSLのインストール
RUN apt-get update -y && apt-get install -y openssl

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# すべてのソースコードをコピー
COPY . .

# Prismaの生成
RUN npx prisma generate

# TypeScriptのビルドと型チェック（--noEmitを削除）
RUN npm run build

# ポートの設定
EXPOSE 3001

# アプリケーションの起動
CMD ["npm", "start"]