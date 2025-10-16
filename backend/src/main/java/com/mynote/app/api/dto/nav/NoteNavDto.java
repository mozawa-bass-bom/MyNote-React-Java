package com.mynote.app.api.dto.nav;

import java.time.LocalDateTime;

public record NoteNavDto(
		Long id,
		Long userId,
		Long categoryId,
		Integer userSeqNo,
		String title,
		LocalDateTime createdAt,
		LocalDateTime updatedAt) {
}
