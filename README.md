# Native Node.js Todo API

這是一個使用 **原生 Node.js API** 與 **PostgreSQL** 開發的 RESTful API 專案。本專案不使用任何 Web 框架（如 Express 或 Hono）及 ORM（如 Prisma），旨在深入理解 HTTP 底層協議、流（Stream）處理及數據庫參數化查詢的安全實踐。

## 🛠 技術棧

- **運行環境**: Node.js v22+
- **服務器**: 原生 `http` 模組
- **數據庫**: PostgreSQL
- **驅動程式**: `pg` (node-postgres)

## 🚀 快速啟動

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數配置

請在根目錄建立 `.env` 文件，並參考以下設定（此文件已被列入 `.gitignore`，不會被提交到 Git）：

```env
PORT=3000
DB_USER=你的用戶名
DB_HOST=localhost
DB_NAME=todo_db
DB_PASSWORD=你的密碼
DB_PORT=5432
```

### 3.數據庫初始化

請在 PostgresSQL 中執行以下 SQL 語句以建立資料表：

```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.啓動服務器

```bash
# 開發模式 (使用 nodemon)
npm run dev

# 生產模式
npm start

```

## 📖 API 接口說明

| 方法   | 路徑       | 說明                       | 成功狀態碼 |
| :----- | :--------- | :------------------------- | :--------- |
| GET    | /todos     | 獲取所有任務（按時間倒序） | 200        |
| GET    | /todos/:id | 獲取特定任務               | 200 / 404  |
| POST   | /todos     | 新增任務（必填 title）     | 201        |
| PUT    | /todos/:id | 修改任務狀態或標題         | 200        |
| DELETE | /todos/:id | 刪除任務                   | 204        |
