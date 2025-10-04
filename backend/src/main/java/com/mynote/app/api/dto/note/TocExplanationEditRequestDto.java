package com.mynote.app.api.dto.note;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

/** 目次の解説（body）編集 */
@Data
public class TocExplanationEditRequestDto implements Serializable {
    @NotBlank
    private String body;
}
