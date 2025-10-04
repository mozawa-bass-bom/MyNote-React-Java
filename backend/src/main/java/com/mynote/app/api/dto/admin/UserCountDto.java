// src/main/java/com/mynote/app/api/dto/admin/UserCountDto.java
package com.mynote.app.api.dto.admin;

public record UserCountDto(
    Long userId,
    Long categoryCount,
    Long noteCount
) {}
