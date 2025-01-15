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

# TypeScriptのビルド（詳細なログ出力を追加）
RUN npx tsc --listFiles

# ポートの設定
EXPOSE 3001

# アプリケーションの起動
CMD ["npm", "start"]