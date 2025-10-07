package com.mynote.app.api.dto.nav;

import java.util.List;
import java.util.Map;

public record NavTreeDto(Map<Long, CategoryNavDto> categories,
        Map<Long, List<NoteNavDto>> notesByCategory) {}
