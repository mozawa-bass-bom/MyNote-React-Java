package com.mynote.app.api.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiSectionDto {
    private String title;
    private Integer startPage;
    private Integer endPage;
    private String contentSummaryHtml;  // 任意
}
