
# upload services (concrete)

生成物（インターフェース不使用）:
- UploadFacadeService : PDFアップロード全体のオーケストレーション
- PdfFormService      : Controller からの入力受け口
- PdfToImageService   : PDF→PNG
- FirebaseStorageService : Firebase Storage へ画像アップロード

## 依存（プロジェクト側に存在する前提）
- Entities:
  - com.mynote.app.domain.entity.Note (id,userId,categoryId,title,description,originalFilename,...)
  - com.mynote.app.domain.entity.NotePage (id,noteId,pageNumber,firebasePublicUrl,firebaseAdminPath,extractedText,...)
- Mappers (MyBatis):
  - com.mynote.app.domain.mapper.NoteMapper#insert(Note)
  - com.mynote.app.domain.mapper.NotePageMapper#insert(NotePage)

## 設定
- GoogleCredentials が Bean 提供されていること（service account）
- application.properties に firebase.storage-bucket が設定されていること

## 使い方（例）
@Autowired PdfFormService pdfFormService;
...
var result = pdfFormService.handle(userId, categoryId, title, pdfMultipart);
System.out.println("noteId=" + result.getNoteId());
System.out.println("imageUrls=" + result.getImageUrls());
