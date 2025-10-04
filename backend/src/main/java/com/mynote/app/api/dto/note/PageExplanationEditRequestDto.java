package com.mynote.app.api.dto.note;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class PageExplanationEditRequestDto {
    @NotBlank
    private String extractedText;
}