package com.mynote.app.api.service.upload;

import java.io.IOException;
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

    private final GoogleCredentials googleCredentials;

    public VisionOcrService(@Qualifier("firebaseCredentials") GoogleCredentials googleCredentials) {
        this.googleCredentials = googleCredentials;
    }

    /** 認証付き設定を生成（内部ユーティリティ） */
    private ImageAnnotatorSettings buildSettings() throws IOException {
        return ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(googleCredentials))
                .build();
    }

    /** 共通：1ページ分のブロックを統一フォーマットで整形（joinEmbeddedText と同じ体裁） */
    private static String formatPageBlock(int pageNo, String text) {
        String body = (text == null || text.isBlank()) ? "(no text)" : text.trim();
        return "--- Page " + pageNo + " ---\n" + body;
    }


    /** gs:// URI 群を順にOCRし、ページ見出し付きで連結して返す */
    public String ocrTextFromGsUris(List<String> gsUris) {
        if (gsUris == null || gsUris.isEmpty()) return "";
        
        StringBuilder sb = new StringBuilder();

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create(buildSettings())) {
            int page = 1;
            for (String gs : gsUris) {
                if (gs == null || gs.isBlank()) continue;

                ImageSource src = ImageSource.newBuilder().setGcsImageUri(gs).build();
                Image img = Image.newBuilder().setSource(src).build();
                Feature feat = Feature.newBuilder().setType(Feature.Type.DOCUMENT_TEXT_DETECTION).build();

                AnnotateImageRequest req = AnnotateImageRequest.newBuilder()
                        .setImage(img)
                        .addFeatures(feat)
                        .build();

                BatchAnnotateImagesResponse resp = client.batchAnnotateImages(List.of(req));
                for (AnnotateImageResponse r : resp.getResponsesList()) {
                    String text = r.hasFullTextAnnotation() ? r.getFullTextAnnotation().getText() : null;
                    sb.append(formatPageBlock(page++, text)).append("\n\n");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("OCR failed: " + e.getMessage(), e);
        }

        return sb.toString().trim();
    }

}
