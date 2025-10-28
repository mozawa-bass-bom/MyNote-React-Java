// src/pages/setting/Setting.tsx
import { Link } from 'react-router-dom';
import DeleteAccountSection from '../../components/setting/DeleteAccountSection';

export default function Setting() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">設定</h1>

      <section className="rounded-xl border bg-white/70 shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-medium">お問い合わせ</h2>
          <p className="mt-1 text-sm text-gray-600">不具合報告・機能要望・その他ご質問などがあればこちらから。</p>
        </div>
        <div className="p-4">
          <Link to="/contact">
            <button className="btn btn-primary">お問い合わせ</button>
          </Link>
        </div>
      </section>

      <DeleteAccountSection />
    </div>
  );
}
