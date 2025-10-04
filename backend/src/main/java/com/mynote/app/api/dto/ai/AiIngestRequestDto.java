package com.mynote.app.api.dto.ai;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiIngestRequestDto {

    private Long noteId; // ← サーバ側で詰める

    private String model;
    private String promptToc;
    private String promptPage;
    private String rawJson;

    @JsonProperty("documentSummary")
    private List<AiDocumentSummaryDto> documentSummary;

    @JsonProperty("sections")
    private List<AiSectionDto> sections;

    @JsonProperty("pageDetails")
    private List<AiPageDetailDto> pageDetails;
}
