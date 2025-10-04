package com.mynote.app.api.dto.note;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

/** 目次のタイトル変更 */
@Data
public class TocRenameRequestDto implements Serializable {
    @NotBlank
    private String title;
}
