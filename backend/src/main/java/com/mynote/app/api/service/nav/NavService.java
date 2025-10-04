package com.mynote.app.api.service.nav;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.nav.CategoryNavDto;
import com.mynote.app.api.dto.nav.NavTreeDto;
import com.mynote.app.api.dto.nav.NoteNavDto;
import com.mynote.app.domain.mapper.CategoryMapper;
import com.mynote.app.domain.mapper.NoteMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NavService {
	private final CategoryMapper categoryMapper;
	private final NoteMapper noteMapper;

	public List<CategoryNavDto> getNavCategories(Long userId) {
		return categoryMapper.selectNavByUserId(userId);
	}

	public Map<Long, List<NoteNavDto>> getNotesGroupedByCategory(Long userId) {
		var notes = noteMapper.findNavByUser(userId);
		// 表示順を維持したいので LinkedHashMap
		return notes.stream().collect(Collectors.groupingBy(
				NoteNavDto::categoryId,
				LinkedHashMap::new,
				Collectors.toList()));
	}

	public NavTreeDto getNavTree(Long userId) {
		var categories = getNavCategories(userId);
		var notesByCategory = getNotesGroupedByCategory(userId);
		// ノート0件のカテゴリも必ずキーを用意
		categories.forEach(c -> notesByCategory.computeIfAbsent(c.id(), k -> new ArrayList<>()));
		return new NavTreeDto(categories, notesByCategory);
	}
}
