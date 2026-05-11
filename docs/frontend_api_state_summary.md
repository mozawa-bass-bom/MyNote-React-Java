# フロントエンド API通信・Jotai状態管理 仕様まとめ

本ドキュメントでは、Reactフロントエンド側でのAPI通信の仕組みと、グローバルな状態管理（Jotai）の設計意図や構造について整理します。

## 1. API通信の設計 (CustomAxios.ts)

システムのAPI呼び出しは、汎用的な `axios` をカスタマイズした `customAxios` インスタンスを通じて一元化されています。

### インターセプター (Interceptors) の仕組み
#### Request Interceptor
- APIにリクエストを送る直前に、`localStorage` から `loginUser` を取得します。
- ユーザーオブジェクトに `token` があれば、ヘッダーに `Authorization: Bearer <token>` を自動付与して送信します。
- Cookie連携（`withCredentials: true`）も有効としています。

#### Response Interceptor
- バックエンドのレスポンスが特定のラッパー（`ApiResponse<T>` 形式など）で返ってきた場合、これを自動的に「剥がす（Unwrapする）」役割を持ちます。
- **204レスポンスやBlob等は処理対象外**とし、JSON以外の場合はそのままパスします。
- サーバーが `success: true` を返した場合は `response.data = body.data` のように中身を入れ替え、利用側が直接データを受け取れるようにします。
- `success: false` の場合や、`401 (Unauthorized)` / `419` 等のセッションタイムアウト発生時は、共通エラーハンドリングが動作し、強制ログアウト処理 (`localStorage.removeItem`, `/login` へのリダイレクト) を行います。

### ユーティリティメソッド
- 直接 `axios.get` 等を呼び出す代わりに、ラッパーメソッドとして `getOk`, `postOk`, `patchOk`, `delOk` が提供されています。
  - 例：`await getOk('/notes')` で直接データ構造のみ取得が可能です。
- エラーハンドリングのためのヘルパー（`isCanceledError`, `toAxiosError`）も整備されています。

---

## 2. 状態管理の設計 (Jotai: states/ フォルダ)

複数の画面やコンポーネント間で共有する必要のある「システム状態」「ユーザー固有データ」は Jotai の Atom エコシステムを利用して管理されています。

### ユーザー情報・セッション系 (`UserAtom.ts`)
- **`loginUserAtom`**: 
  - `atomWithStorage` を使って localStorage に同期されます。これによりブラウザのリロード後もログイン状態とAPIトークンが維持されます。
- **`roleAtom`**: 
  - `USER` または `ADMIN` セッションのロール。

### アプリケーションデータ系 (`UserAtom.ts`)
- 階層構造（カテゴリ）やノート一覧など、再参照頻度の高いデータをマップ構造等で保有し、不要な通信を削減しています。
- **`categoriesByIdAtom` (Map)**: カテゴリIDをキーにした全カテゴリの情報。
- **`notesByCategoryIdAtom` (Map)**: カテゴリIDに紐づくノートのリスト一覧情報。
- **`tocByNoteIdAtom` (Map)**: 特定のノート詳細を開いた時に表示するための目次情報。
- **`noteDetailByIdAtom` (Map)**: 一度開いたノート詳細の本文や画像メタ情報等を保持（実質的なキャッシュ機能）。

### UIの選択状態系 (`UserAtom.ts`)
- **`selectedCategoryIdAtom`**, **`selectedNoteIdAtom`**: 現在ユーザーが選択・閲覧している対象を保持。ツリー型のサイドバー等から他のUI要素との連動に使われます。

### トースト通知システム (`ToastAtom.ts`)
- ユーザーに一時的なフィードバック（「保存しました」「エラーが発生しました」等）を表示するための中央システム。
- **`toastsAtom`**: 現在表示中の一覧。
- **`addToastAtom`**: 通知を追加（内部で `setTimeout` を用いて、指定ミリ秒後に自動で配列から削除するアクション）。

### グローバルデータのリセット
- **`resetAllUserStateAtom`**: ログアウト処理時に呼び出すことで、ローカルストレージ以外の全てのメモリ上の Map やデータを空にし、次回のユーザーログイン時に残渣が残らないようにします。

---

## 3. 今後の拡張や実装時のルール
- 新たにバックエンドのAPIをコールする場合は、コンポーネント内で直接 `fetch` を行わず、`getOk` などのラッパー関数を使用してください。
- 複数のコンポーネントで参照する状態は useState ではなく、Jotai の Atom として定義することを検討してください。
