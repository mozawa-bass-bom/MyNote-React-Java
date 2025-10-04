package com.mynote.app.api.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiPageDetailDto {
    private Integer pageNumber;

    private String detailedExplanationHtml;
    private String detailedExplanationMarkdown;

}
