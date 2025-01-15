# ベースイメージ
FROM node:18-slim

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# Prismaの生成
RUN npx prisma generate

# ソースコードをコピー
COPY . .

# TypeScriptのビルド
RUN npm run build

# ポートの設定
EXPOSE 3000

# アプリケーションの起動
CMD ["npm", "start"]