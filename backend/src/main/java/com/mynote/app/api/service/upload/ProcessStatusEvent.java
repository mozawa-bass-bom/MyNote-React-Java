package com.mynote.app.api.service.upload;

public record ProcessStatusEvent(
        Code code,
        String message,
        Long noteId,
        boolean finished,
        Mode mode
) {
    public enum Code { UPLOAD_DONE, OCR_DONE, OCR_SKIPPED, AI_DONE, ERROR, COMPLETE }
    public enum Mode { FULL, SIMPLE }

    public static ProcessStatusEvent uploadDone(Long noteId, Mode mode) {
        return new ProcessStatusEvent(Code.UPLOAD_DONE, "アップロードが完了しました", noteId, false, mode);
    }

    public static ProcessStatusEvent ocrDone(Long noteId, Mode mode) {
        return new ProcessStatusEvent(Code.OCR_DONE, "OCRが完了しました", noteId, false, mode);
    }

    public static ProcessStatusEvent ocrSkipped(Long noteId, Mode mode) {
        return new ProcessStatusEvent(Code.OCR_SKIPPED, "OCRをスキップしました", noteId, false, mode);
    }

    public static ProcessStatusEvent aiDone(Long noteId, Mode mode) {
        return new ProcessStatusEvent(Code.AI_DONE, "AI解析が完了しました", noteId, false, mode);
    }

    public static ProcessStatusEvent complete(Long noteId, Mode mode) {
        return new ProcessStatusEvent(Code.COMPLETE, "処理が完了しました", noteId, true, mode);
    }

    public static ProcessStatusEvent error(Long noteId, String message, Mode mode) {
        return new ProcessStatusEvent(Code.ERROR, message, noteId, true, mode);
    }
}
