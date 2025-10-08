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

	/** 表示順で取得される前提（SQL側で ORDER BY 済み） */
	public Map<Long, CategoryNavDto> getNavCategories(Long userId) {
		List<CategoryNavDto> categories = categoryMapper.selectNavByUserId(userId);

		// 表示順維持のため LinkedHashMap に収集
		return categories.stream().collect(Collectors.toMap(
				CategoryNavDto::id,
				c -> c,
				(a, b) -> a, // 同一ID衝突時は先勝ち
				LinkedHashMap::new));
	}

	/** カテゴリIDごとにノートをグルーピング（表示順維持） */
	public Map<Long, List<NoteNavDto>> getNotesGroupedByCategory(Long userId) {
		var notes = noteMapper.findNavByUser(userId);

		// Map も List も具体型を固定しておくと安心
		return notes.stream().collect(Collectors.groupingBy(
				NoteNavDto::categoryId,
				LinkedHashMap::new,
				Collectors.toCollection(ArrayList::new)));
	}

	/** Jotai 側に直で流せる Map 形式 */
	public NavTreeDto getNavTree(Long userId) {
		Map<Long, CategoryNavDto> categoriesById = getNavCategories(userId);
		Map<Long, List<NoteNavDto>>  notesByCategory = getNotesGroupedByCategory(userId);

		// ★ ノート0件カテゴリにも空配列を用意（フロント実装がシンプルになる）
		categoriesById.keySet().forEach(cid -> notesByCategory.computeIfAbsent(cid, k -> new ArrayList<>()));

		return new NavTreeDto(categoriesById, notesByCategory);
	}
}