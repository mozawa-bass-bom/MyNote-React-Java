# CRUDマトリクス (テーブル別) (crud_table_by_table.xlsx)

## Sheet1
| テーブル名 | 機能 | CRUD | 処理内容 |
|---|---|---|---|
| users | F01-1-1 ユーザー情報入力処理 | C | INSERT |
| users | F01-1-2 MySQLアカウント作成処理 | C | INSERT |
| users | F01-1-2 MySQLアカウント作成処理 | R | SELECT（重複確認） |
| users | F01-2-1 ログイン処理 | R | SELECT（認証） |
| users | F01-3-2 MySQLからユーザー削除 | D | DELETE（Cascade） |
| users | F02-1-1 ユーザー選択処理 | R | SELECT（一覧取得） |
| users | F02-1-3 MySQLからユーザー削除 | D | DELETE（Cascade） |
| users | F05-1-1 ログインID情報取得 | R | SELECT |
| users | F08-1-1 ログイン判別機能 | R | SELECT（ログイン情報取得） |
| user_passwords | F01-1-1 ユーザー情報入力処理 | C | INSERT |
| user_passwords | F01-1-3 パスワードリセット処理 | R | SELECT（メール存在確認） |
| user_passwords | F01-1-3 パスワードリセット処理 | U | UPDATE（パスワード変更） |
| user_passwords | F01-2-1 ログイン処理 | R | SELECT（認証） |
| categories | F04-1-1 カテゴリ追加 | C | INSERT |
| categories | F04-1-2 カテゴリ編集 | U | UPDATE |
| categories | F04-1-3 カテゴリ削除 | D | DELETE |
| categories | F06-1-2 プロンプトの保存 | U | UPDATE（prompt_1 / prompt_2） |
| notes | F03-1-1 PDFファイルアップロード | C | INSERT（ノート登録） |
| notes | F05-1-2 ノート本文・画像取得 | R | SELECT |
| notes | F05-2-1 ノート編集フォーム表示 | R | SELECT |
| notes | F05-2-2 ノート内容保存 | U | UPDATE |
| note_pages | F03-1-2 Firebase保存とURL取得 | C | INSERT（ページ登録） |
| note_pages | F03-1-3 メタ情報のDB登録 | C | INSERT |
| note_pages | F03-1-4 OCRによる文字抽出 | U | UPDATE（抽出テキスト保存） |
| note_pages | F05-1-2 ノート本文・画像取得 | R | SELECT |
| note_pages | F05-3-1 ファイル・ページ削除 | D | DELETE |
| note_pages | F01-3-1 Firebaseファイル削除 | R | SELECT（削除対象取得） |
| note_pages | F02-1-2 Firebaseファイル削除 | R | SELECT（対象取得） |
| note_index | F03-3-2 テキスト整形と保存 | C | INSERT |
| contacts | F02-2-1 お問い合わせ表示 | R | SELECT（一覧取得） |
| contacts | F02-2-2 ページ分割機能 | R | SELECT（ページネーション） |
| contacts | F02-2-3 お問い合わせ削除 | D | DELETE |
| contacts | F08-1-2 お問い合わせ送信 | C | INSERT |
