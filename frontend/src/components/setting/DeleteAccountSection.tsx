import DeleteAccountButton from '../../ui/DeleteAccountButton';

export default function DeleteAccountSection() {
  return (
    <section className="rounded-xl border bg-background/70 shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">ユーザー情報の削除</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          退会すると、あなたのアカウントと関連データ（ノート等）は復元できません。
        </p>
      </div>
      <div className="p-4">
        <DeleteAccountButton />
      </div>
    </section>
  );
}
