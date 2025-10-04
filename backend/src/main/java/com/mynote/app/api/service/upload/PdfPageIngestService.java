package com.mynote.app.api.service.upload;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mynote.app.api.service.upload.UploadFacadeService.PageData;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PdfPageIngestService {

	private final FirebaseStorageService firebaseStorageService;

	public List<PageData> ingest(MultipartFile pdf, int dpi, Long userId,Long categoryId, Long noteId, boolean includeEmbeddedText)
			throws IOException {
		if (pdf == null || pdf.isEmpty())
			throw new IllegalArgumentException("PDF file is required");

		List<PageData> pages = new ArrayList<>();
		File tempImage = null;

		try (PDDocument doc = PDDocument.load(pdf.getInputStream())) {
			PDFRenderer renderer = new PDFRenderer(doc);
			renderer.setSubsamplingAllowed(true); 
			
			PDFTextStripper stripper = includeEmbeddedText ? new PDFTextStripper() : null;
			int pageCount = doc.getNumberOfPages();

			for (int i = 0; i < pageCount; i++) {
				int pageNo = i + 1;

				// 1) レンダリング → 一時PNG
				BufferedImage image = renderer.renderImageWithDPI(i, dpi);
				tempImage = File.createTempFile("page-" + pageNo + "-", ".png");
				ImageIO.write(image, "png", tempImage);

				// 2) ノート配下の固定パスにアップロード
				FirebaseStorageService.UploadedImage up = 
					firebaseStorageService.uploadNotePageImage(userId,categoryId,noteId, pageNo,tempImage);

				// 3) （必要なときだけ）埋め込みテキスト抽出
				String text = null;
				if (stripper != null) {
					stripper.setStartPage(pageNo);
					stripper.setEndPage(pageNo);
					text = trimToNull(stripper.getText(doc));
				}

				pages.add(new PageData(pageNo, up.publicUrl(), up.gsUri(), text));

				// 後片付け
				safeDelete(tempImage);
				tempImage = null;
			}
		} finally {
			safeDelete(tempImage);
		}
		return pages;
	}

	private static String trimToNull(String s) {
		if (s == null)
			return null;
		String t = s.trim();
		return t.isEmpty() ? null : t;
	}

	private static void safeDelete(File f) {
		if (f == null)
			return;
		try {
			if (f.exists())
				f.delete();
		} catch (Exception ignore) {
		}
	}
}
