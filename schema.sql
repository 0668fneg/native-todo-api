-- 1. 主鍵表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,--自動增序主鍵
    username VARCHAR(50) UNIQUE NOT NULL,--唯一約束，不能爲空
    password VARCHAR(255) NOT NULL  
);

-- 2. 外鍵表
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,--自動增序主鍵
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE, --布林值，默認爲false
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,--自動填入默認的當前時間
    user_id INTEGER NOT NULL REFERENCES users(id)--整數，不能爲空，聞聯users_id
);