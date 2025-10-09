import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { selectedNoteIdAtom, selectedCategoryIdAtom } from '../../states/UserAtom';
import { type NoteDetailResponse, type ApiNoteDetailData, toNoteDetailResponse } from '../../types/base';
import customAxios from '../../helpers/CustomAxios';

async function getNoteDetailsBySeq(userSeqNo: number) {
  const res = await customAxios.get<ApiNoteDetailData>(`/notes/${userSeqNo}`);
  return res.data; // { note, toc, page }
}

export default function NoteDetails() {
  const { userSeqNo } = useParams<{ userSeqNo: string }>();
  const seq = userSeqNo ? Number(userSeqNo) : NaN;
  const isValid = useMemo(() => Number.isInteger(seq) && seq > 0, [seq]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setSelectedNoteId = useSetAtom(selectedNoteIdAtom);
  const setSelectedCategoryId = useSetAtom(selectedCategoryIdAtom);

  useEffect(() => {
    if (!isValid) return;
    (async () => {
      try {
        const api = await getNoteDetailsBySeq(seq);
        const data: NoteDetailResponse = toNoteDetailResponse(api);
        setSelectedNoteId(data.id);
        setSelectedCategoryId(data.categoryId);
      } catch (e: unknown) {
        // ここは簡素に（詳細処理は Axios 側の interceptor に寄せてもOK）
        console.error('fetch note by userSeqNo failed:', e);
      }
    })();
  }, [isValid, seq, setSelectedNoteId, setSelectedCategoryId]);

  // フックの後で分岐（Rules of Hooks順守）
  if (!isValid) return <Navigate to="/notes" replace />;

  // --- JSX（適当表示） ---
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>{detail.title}</h1>
      <p style={{ color: '#555', marginTop: 0 }}>{detail.description}</p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
        <div style={{ flex: '1 1 280px', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <h2 style={{ fontSize: 16, marginTop: 0 }}>メタ情報</h2>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Note ID: {detail.id}</li>
            <li>UserSeqNo: {detail.userSeqNo}</li>
            <li>Category ID: {detail.categoryId}</li>
            <li>作成: {detail.createdAt}</li>
            <li>更新: {detail.updatedAt}</li>
          </ul>
        </div>

        <div style={{ flex: '2 1 360px', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <h2 style={{ fontSize: 16, marginTop: 0 }}>目次</h2>
          {detail.tocItems.length === 0 ? (
            <div style={{ color: '#777' }}>— 目次なし —</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              {detail.tocItems.map((t) => (
                <li key={t.id}>
                  {t.indexNumber}. {t.title}（{t.startPage}–{t.endPage}）
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16 }}>ページ</h2>
        {detail.pageItems.length === 0 ? (
          <div style={{ color: '#777' }}>— ページなし —</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {detail.pageItems.map((p) => (
              <div key={p.id} style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: 8, background: '#fafafa', borderBottom: '1px solid #eee' }}>
                  p.{p.pageNumber}
                </div>
                <div style={{ padding: 12 }}>
                  <img
                    src={p.imageUrl}
                    alt={`page ${p.pageNumber}`}
                    style={{ width: '100%', height: 'auto', borderRadius: 6 }}
                  />
                  {p.extractedText && (
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8, fontSize: 12, color: '#444' }}>
                      {p.extractedText}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
