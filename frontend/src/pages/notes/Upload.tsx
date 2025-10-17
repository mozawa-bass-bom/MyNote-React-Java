import UploadForm from '../../components/upload/Uploadform';

export default function Upload() {
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">PDF アップロード</h1>
      <UploadForm />
    </div>
  );
}
