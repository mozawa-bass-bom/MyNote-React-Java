package com.mynote.app.api.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiDocumentSummaryDto {
    private String overallSummaryMd;
}
