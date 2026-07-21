package com.mynote.app.api.dto.note;

import java.util.List;

import lombok.Data;

@Data
public class NoteByUserSeqNoResponseDto {
	private NoteResponseDto note;
	private List<TocResponseDto> toc;
	private List<PageResponseDto> page;
}
