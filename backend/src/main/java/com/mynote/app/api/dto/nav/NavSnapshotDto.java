package com.mynote.app.api.dto.nav;

import java.util.List;
import java.util.Map;

import com.mynote.app.api.dto.note.TocResponseDto;

public record NavSnapshotDto(
	    Map<Long, CategoryNavDto> categories,
	    Map<Long, List<NoteNavDto>> notesByCategory,
	    Map<Long, List<TocResponseDto>> tocList
	) {}
