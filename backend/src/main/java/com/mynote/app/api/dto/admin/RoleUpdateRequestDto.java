package com.mynote.app.api.dto.admin;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class RoleUpdateRequestDto {
    // 例: "ROLE_USER", "ROLE_ADMIN", "ROLE_BLOCKED" など
    @NotBlank
    private String role; 
}