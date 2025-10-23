package com.mynote.app.api.dto.upload;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.multipart.MultipartFile;

import com.mynote.app.api.service.upload.ProcessStatusEvent.Mode;

import lombok.Data;

/** G03-1: PDFアップロード時の入力 */
@Data
public class PdfUploadRequestDto implements Serializable {

    /** アップロードするPDF */
    @NotNull
    private MultipartFile file;

    /** 元ファイル名（未指定ならフロントで file.name をセット推奨） */
    @NotBlank
    private String originalFileName;

    /** 登録するノートの表示名（notes.title） */
    @NotBlank
    private String noteTitle;

    
    /** 既存カテゴリに入れるか（false=既存, true=新規作成） */
    private boolean createNewCategory;

    /** createNewCategory=false のときに使用するカテゴリID */
    private Long existingCategoryId;

    /** createNewCategory=true のときに使用する新規カテゴリ名 */
    private String newCategoryName;

    /** 目次生成用プロンプト（任意） */
    private String tocPrompt;

    /** ページ注釈生成用プロンプト（任意） */
    private String pagePrompt;

    /** 入力したプロンプトをカテゴリのデフォルトとして保存するか（任意） */
    private Boolean saveAsDefault;

    private Mode mode;

}
