// src/components/contact/ConfirmTable.tsx
type Props = {
  name: string;
  email: string;
  message: string;
  isPending?: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

export default function ConfirmTable({ name, email, message, isPending, onBack, onSubmit }: Props) {
  return (
    <div className="space-y-4">
      <table className="w-full max-w-2xl text-sm border rounded overflow-hidden">
        <tbody>
          <tr className="border-b">
            <th className="bg-gray-50 w-32 p-2 text-left font-medium">お名前</th>
            <td className="p-2">{name}</td>
          </tr>
          <tr className="border-b">
            <th className="bg-gray-50 w-32 p-2 text-left font-medium">メール</th>
            <td className="p-2">{email}</td>
          </tr>
          <tr>
            <th className="bg-gray-50 w-32 p-2 text-left align-top font-medium">内容</th>
            <td className="p-2 whitespace-pre-wrap">{message}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="rounded border px-3 py-1.5 disabled:opacity-50"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="rounded bg-black/80 text-white px-4 py-1.5 disabled:opacity-50"
        >
          {isPending ? '送信中…' : '送信する'}
        </button>
      </div>
    </div>
  );
}
