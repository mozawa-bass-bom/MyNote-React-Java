package com.mynote.app.api.dto.category;

import lombok.Data;
import java.io.Serializable;

/** カテゴリに関連付けられた既定プロンプトの取得応答 */
@Data
public class CategoryPromptResponseDto implements Serializable {
    private Long categoryId;
    private String prompt1;
    private String prompt2;
}
