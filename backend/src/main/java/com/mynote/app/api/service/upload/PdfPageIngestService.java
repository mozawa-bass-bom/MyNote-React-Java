package com.mynote.app.api.service.upload;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mynote.app.api.service.upload.UploadFacadeService.PageData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfPageIngestService {

    private final FirebaseStorageService firebaseStorageService;

    /**
     * PDF を各ページごとにレンダリング → Firebase アップロードする。
     *
     * <p>レンダリング（PDFRenderer）はスレッドセーフでないため同期実行し、
     * Firebase へのアップロード（I/O待ちが主コスト）は CompletableFuture で並列実行する。
     *
     * <p>スレッド数は「ページ数」と「CPU数×2」の小さい方を上限とする。
     */
    public List<PageData> ingest(MultipartFile pdf, int dpi, Long userId,
                                 Long categoryId, Long noteId, boolean includeEmbeddedText)
            throws IOException {

        if (pdf == null || pdf.isEmpty())
            throw new IllegalArgumentException("PDF file is required");

        // --- レンダリング フェーズ（シングルスレッド：PDFRenderer は非スレッドセーフ）---
        record RenderedPage(int pageNo, File tempImage, String embeddedText) {}

        List<RenderedPage> rendered = new ArrayList<>();

        try (PDDocument doc = PDDocument.load(pdf.getInputStream())) {
            PDFRenderer renderer = new PDFRenderer(doc);
            renderer.setSubsamplingAllowed(true);

            PDFTextStripper stripper = includeEmbeddedText ? new PDFTextStripper() : null;
            int pageCount = doc.getNumberOfPages();

            for (int i = 0; i < pageCount; i++) {
                int pageNo = i + 1;

                // レンダリング（PDDocument が生きている間に完了させる必要あり）
                BufferedImage image = renderer.renderImageWithDPI(i, dpi);
                File tempImage = File.createTempFile("page-" + pageNo + "-", ".png");
                ImageIO.write(image, "png", tempImage);

                String text = null;
                if (stripper != null) {
                    stripper.setStartPage(pageNo);
                    stripper.setEndPage(pageNo);
                    text = trimToNull(stripper.getText(doc));
                }

                rendered.add(new RenderedPage(pageNo, tempImage, text));
            }
        }
        // PDDocument を閉じた後でアップロードを並列実行（temp ファイルは残っている）

        // --- アップロード フェーズ（並列：Firebase I/O は独立） ---
        int parallelism = Math.min(rendered.size(),
                Runtime.getRuntime().availableProcessors() * 2);
        ExecutorService pool = Executors.newFixedThreadPool(parallelism);

        try {
            List<CompletableFuture<PageData>> futures = rendered.stream()
                    .map(rp -> CompletableFuture.supplyAsync(() -> {
                        try {
                            FirebaseStorageService.UploadedImage up =
                                    firebaseStorageService.uploadNotePageImage(
                                            userId, categoryId, noteId, rp.pageNo(), rp.tempImage());
                            log.debug("[ingest] page={} uploaded -> {}", rp.pageNo(), up.publicUrl());
                            return new PageData(rp.pageNo(), up.publicUrl(), up.gsUri(), rp.embeddedText());
                        } catch (IOException e) {
                            throw new RuntimeException("Upload failed for page " + rp.pageNo(), e);
                        } finally {
                            safeDelete(rp.tempImage());
                        }
                    }, pool))
                    .toList();

            // 全ページの完了を待ち、ページ番号順にソートして返す
            return futures.stream()
                    .map(CompletableFuture::join) // 例外は RuntimeException としてここで再スロー
                    .sorted(Comparator.comparingInt(PageData::getPageNumber))
                    .toList();

        } finally {
            pool.shutdown();
            // 残った temp ファイルをクリーンアップ（正常時はアップロード内部で削除済み）
            rendered.forEach(rp -> safeDelete(rp.tempImage()));
        }
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static void safeDelete(File f) {
        if (f == null) return;
        try {
            if (f.exists()) f.delete();
        } catch (Exception ignore) {
        }
    }
}
