# CRUDマトリクス (crud_table.xlsx)

## Sheet1: 機能別 CRUD対象テーブル
| 機能ID | 機能名 | 対象テーブル | C (作成) | R (参照) | U (更新) | D (削除) | 備考 |
|---|---|---|---|---|---|---|---|
| F01-1-1 | ユーザー情報入力処理 | users, user_passwords | INSERT | - | - | - | - |
| F01-1-2 | MySQLアカウント作成処理 | users | INSERT | SELECT(重複確認) | - | - | - |
| F01-1-3 | パスワードリセット処理 | user_passwords | - | SELECT(メール確認) | UPDATE(PW変更) | - | - |
| F01-2-1 | ログイン処理 | users, user_passwords | - | SELECT(認証) | - | - | - |
| F01-2-2 | ログアウト処理 | (セッション) | - | - | - | - | セッション破棄のみ |
| F01-3-1 | Firebaseファイル削除 | note_pages等 | - | SELECT(対象取得) | - | DELETE(Storage側) | - |
| F01-3-2 | MySQLからユーザー削除 | users他全関連 | - | - | - | DELETE(Cascade) | - |
| F02-1-1 | ユーザー選択処理 | users | - | SELECT(一覧取得) | - | - | - |
| F02-1-2 | Firebaseファイル削除 | note_pages等 | - | SELECT(対象取得) | - | DELETE | - |
| F02-1-3 | MySQLからユーザー削除 | users他 | - | - | - | DELETE(Cascade) | - |
| F02-2-1 | お問い合わせ表示 | contacts | - | SELECT(一覧取得) | - | - | - |
| F02-2-2 | ページ分割機能 | contacts | - | SELECT | - | - | - |
| F02-2-3 | お問い合わせ削除 | contacts | - | - | - | DELETE | - |
| F03-1-1 | PDFファイルアップロード | notes | INSERT(登録) | - | - | - | - |
| F03-1-2 | Firebase保存とURL取得 | note_pages | INSERT(登録) | - | - | - | - |
| F03-1-3 | メタ情報のDB登録 | note_pages | INSERT | - | - | - | 画像URLやページ番号 |
| F03-1-4 | OCRによる文字抽出 | note_pages | - | - | UPDATE | - | 抽出テキスト保存 |
| F03-2-1 | テキスト送信処理 | - | - | SELECT(OCR結果) | - | - | AI API 送信・受信 |
| F03-3-2 | テキスト整形と保存 | note_index | INSERT | - | - | - | - |
| F04-1-1 | カテゴリ追加 | categories | INSERT | - | - | - | - |
| F04-1-2 | カテゴリ編集 | categories | - | - | UPDATE | - | - |
| F04-1-3 | カテゴリ削除 | categories | - | - | - | DELETE | - |
| F05-1-1 | ログインID情報取得 | users | - | SELECT | - | - | - |
| F05-1-2 | ノート本文・画像取得 | notes, note_pages | - | SELECT | - | - | - |
| F05-2-1 | ノート編集フォーム表示 | notes | - | SELECT | - | - | - |
| F05-2-2 | ノート内容保存 | notes | - | - | UPDATE | - | - |
| F05-3-1 | ファイル・ページ削除 | note_pages | - | - | - | DELETE | - |
| F06-1-2 | プロンプトの保存 | categories | - | - | UPDATE | - | prompt_1, 2 |
| F07-1-1 | アクセス権の確認 | notes | - | SELECT | - | - | doFilterで照合 |
| F08-1-2 | お問い合わせ送信 | contacts | INSERT | - | - | - | - |
