package com.mynote.app.api.dto.category;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

/** カテゴリの名称変更など軽量PATCH */
@Data
public class CategoryPatchRequestDto implements Serializable {
    @NotBlank
    private String name;
}
