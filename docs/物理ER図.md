# 物理ER図 (テーブル定義)

以下のテーブルが定義されています。

## users
- `id` (INT) - PRIMARY
- `login_id` (VARCHAR)
- `email` (VARCHAR)
- `created_at` (DATETIME)
- `role` (VARCHAR)

## user_passwords
- `user_id` (INT) - PRIMARY
- `password_hash` (VARCHAR)
- `updated_at` (DATETIME)

## categories
- `id` (INT) - PRIMARY
- `user_id` (INT)
- `name` (VARCHAR)
- `prompt_1` (TEXT)
- `prompt_2` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## notes
- `id` (BIGINT)
- `user_id` (INT)
- `category_id` (INT)
- `title` (VARCHAR)
- `description` (TEXT)
- `original_filename` (VARCHAR)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## note_pages
- `id` (BIGINT) - PRIMARY
- `note_id` (BIGINT)
- `page_number` (INT)
- `firebase_public_url` (VARCHAR)
- `firebase_admin_path` (VARCHAR)
- `extracted_text` (TEXT)

## note_index
- `id` (BIGINT) - PRIMARY
- `note_id` (BIGINT)
- `index_number` (INT)
- `start_index` (INT)
- `end_index` (INT)
- `title` (VARCHAR)
- `body` (TEXT)

## contacts
- `id` (INT) - PRIMARY
- `user_id` (INT)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `message` (TEXT)
- `created_at` (DATETIME)
