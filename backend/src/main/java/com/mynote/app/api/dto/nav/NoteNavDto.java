package com.mynote.app.api.dto.nav;

public record NoteNavDto(
		Long id,
		Long userId,
		Long categoryId,
		Integer userSeqNo,
		String title) {
}
