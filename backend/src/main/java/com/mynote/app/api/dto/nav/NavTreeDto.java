package com.mynote.app.api.dto.nav;

import java.util.List;
import java.util.Map;

public record NavTreeDto(List<CategoryNavDto> categories,
        Map<Long, List<NoteNavDto>> notesByCategory) {}
