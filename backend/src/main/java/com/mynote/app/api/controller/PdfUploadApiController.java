package com.mynote.app.api.controller;

import java.io.IOException;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.mynote.app.api.dto.category.CategoryRequestDto;
import com.mynote.app.api.dto.upload.PdfUploadRequestDto;
import com.mynote.app.api.service.category.CategoryService;
import com.mynote.app.api.service.upload.ProcessStatusEvent;
import com.mynote.app.api.service.upload.ProcessStatusEvent.Mode;
import com.mynote.app.api.service.upload.UploadFacadeService;

import lombok.RequiredArgsConstructor;

/**
 * PDFアップロードAI実行用API (SSE対応版, Mode=FULL/SIMPLE)
 */
@RestController
@RequestMapping("/api/notes/upload")
@RequiredArgsConstructor
@Validated
public class PdfUploadApiController {

    private final UploadFacadeService uploadFacadeService;
    private final CategoryService categoryService;

    /* =========================
     * 1) PDFアップロード & 処理ストリームの開始 (SSEを利用)
     *    - Mode.FULL   : 画像→OCR→AI
     *    - Mode.SIMPLE : 画像→AI（OCRスキップ）
     * ========================= */
    @PostMapping(
            path = "/process-stream",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter processPdfAndStream(
            @SessionAttribute(name = "userId", required = true) Long userId,
            @Valid @ModelAttribute PdfUploadRequestDto req) {

        // 1. SSE接続確立（以降の進捗は Facade 側から push）
        SseEmitter emitter = uploadFacadeService.addEmitter(userId);

        // 2. モード解決（未指定は FULL）
        Mode mode = resolveMode(req);

        // 3. カテゴリ解決
        Long categoryId;
        String tocPrompt = req.getTocPrompt();
        String pagePrompt = req.getPagePrompt();

        try {
            if (req.isCreateNewCategory()) {
                if (req.getNewCategoryName() == null || req.getNewCategoryName().isBlank()) {
                    emitter.send(SseEmitter.event().data(
                            ProcessStatusEvent.error(null, "newCategoryName is required when createNewCategory=true", mode),
                            MediaType.APPLICATION_JSON));
                    emitter.complete();
                    return emitter;
                }

                CategoryRequestDto categoryDto = new CategoryRequestDto();
                categoryDto.setName(req.getNewCategoryName());

                if (Boolean.TRUE.equals(req.getSaveAsDefault())) {
                    categoryDto.setPrompt1(tocPrompt);
                    categoryDto.setPrompt2(pagePrompt);
                }

                Long newCategoryId = categoryService.create(userId, categoryDto);
                if (newCategoryId == null) {
                    emitter.send(SseEmitter.event().data(
                            ProcessStatusEvent.error(null, "Category creation failed, potentially due to duplicate name.", mode),
                            MediaType.APPLICATION_JSON));
                    emitter.complete();
                    return emitter;
                }
                categoryId = newCategoryId;

            } else {
                if (req.getExistingCategoryId() == null) {
                    emitter.send(SseEmitter.event().data(
                            ProcessStatusEvent.error(null, "existingCategoryId is required when createNewCategory=false", mode),
                            MediaType.APPLICATION_JSON));
                    emitter.complete();
                    return emitter;
                }
                categoryId = req.getExistingCategoryId();
            }

            // 4. メイン処理開始（非同期）
            uploadFacadeService.processPdfAsync(
                    userId,
                    categoryId,
                    req.getNoteTitle(),
                    req.getFile(),
                    tocPrompt,
                    pagePrompt,
                    mode  
            );

          
            return emitter;

        } catch (IOException e) {
            // SSE送信中に起こり得るI/O例外（接続切断など）
            return emitter;
        } catch (Exception e) {
            try {
                emitter.send(SseEmitter.event().data(
                        ProcessStatusEvent.error(null, "初期処理中にエラーが発生しました: " + e.getMessage(), mode),
                        MediaType.APPLICATION_JSON));
            } catch (IOException ignore) {}
            emitter.complete();
            return emitter;
        }
    }

    /**
     * リクエストから Mode を素直に解決（未指定/不正値は FULL）
     * - 文字列の getMode(): "FULL" / "SIMPLE" を想定
     * - フィールドが無ければ FULL にフォールバック
     */
    private Mode resolveMode(PdfUploadRequestDto req) {
        try {
            // もし DTO に getMode()（String）があるなら利用
            var m = PdfUploadRequestDto.class.getMethod("getMode").invoke(req);
            if (m instanceof String s && !s.isBlank()) {
                try { return Mode.valueOf(s.trim().toUpperCase()); } catch (IllegalArgumentException ignore) {}
            }
        } catch (NoSuchMethodException ignore) {
            // フィールドが無い場合は FULL にフォールバック
        } catch (Exception ignore) { }
        return Mode.FULL;
    }
}
