package com.mynote.app.api.service.upload;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vision.v1.AnnotateImageRequest;
import com.google.cloud.vision.v1.AnnotateImageResponse;
import com.google.cloud.vision.v1.BatchAnnotateImagesResponse;
import com.google.cloud.vision.v1.Feature;
import com.google.cloud.vision.v1.Image;
import com.google.cloud.vision.v1.ImageAnnotatorClient;
import com.google.cloud.vision.v1.ImageAnnotatorSettings;
import com.google.cloud.vision.v1.ImageSource;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class VisionOcrService {

    /** Vision API の1バッチあたり最大リクエスト数 */
    private static final int VISION_BATCH_LIMIT = 16;

    private final GoogleCredentials googleCredentials;

    public VisionOcrService(@Qualifier("firebaseCredentials") GoogleCredentials googleCredentials) {
        this.googleCredentials = googleCredentials;
    }

    private ImageAnnotatorSettings buildSettings() throws IOException {
        return ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(googleCredentials))
                .build();
    }

    private static String formatPageBlock(int pageNo, String text) {
        String body = (text == null || text.isBlank()) ? "(no text)" : text.trim();
        return "--- Page " + pageNo + " ---\n" + body;
    }

    /**
     * gs:// URI 群を【1回または少数のバッチ】でまとめてOCRし、ページ見出し付きで連結して返す。
     * Vision API の上限（16件/バッチ）を超える場合は自動的に分割して順次送信する。
     */
    public String ocrTextFromGsUris(List<String> gsUris) {
        if (gsUris == null || gsUris.isEmpty()) return "";

        // 有効な URI だけ抽出（順序を維持）
        List<String> validUris = gsUris.stream()
                .filter(gs -> gs != null && !gs.isBlank())
                .toList();
        if (validUris.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create(buildSettings())) {

            // VISION_BATCH_LIMIT 件ごとに分割してバッチ送信
            int pageOffset = 1; // ページ番号カウンタ
            for (int start = 0; start < validUris.size(); start += VISION_BATCH_LIMIT) {
                int end = Math.min(start + VISION_BATCH_LIMIT, validUris.size());
                List<String> chunk = validUris.subList(start, end);

                // バッチリクエスト構築
                List<AnnotateImageRequest> reqs = new ArrayList<>(chunk.size());
                for (String gs : chunk) {
                    ImageSource src = ImageSource.newBuilder().setGcsImageUri(gs).build();
                    Image img = Image.newBuilder().setSource(src).build();
                    Feature feat = Feature.newBuilder()
                            .setType(Feature.Type.DOCUMENT_TEXT_DETECTION)
                            .build();
                    reqs.add(AnnotateImageRequest.newBuilder()
                            .setImage(img)
                            .addFeatures(feat)
                            .build());
                }

                log.debug("[OCR] sending batch pages={}-{} ({}件)", pageOffset, pageOffset + chunk.size() - 1, chunk.size());
                BatchAnnotateImagesResponse resp = client.batchAnnotateImages(reqs);

                for (AnnotateImageResponse r : resp.getResponsesList()) {
                    String text = r.hasFullTextAnnotation() ? r.getFullTextAnnotation().getText() : null;
                    sb.append(formatPageBlock(pageOffset++, text)).append("\n\n");
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("OCR failed: " + e.getMessage(), e);
        }

        return sb.toString().trim();
    }
}
