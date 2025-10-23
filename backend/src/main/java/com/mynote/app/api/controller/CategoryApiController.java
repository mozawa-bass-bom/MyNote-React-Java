// src/main/java/com/mynote/app/api/controller/CategoryApiController.java
package com.mynote.app.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.mynote.app.api.dto.ApiResponse;
import com.mynote.app.api.dto.category.CategoryPatchRequestDto;
import com.mynote.app.api.dto.category.CategoryPromptResponseDto;
import com.mynote.app.api.dto.category.CategoryRequestDto;
import com.mynote.app.api.service.category.CategoryService;
import com.mynote.app.api.service.upload.FirebaseStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/notes/categories")
@RequiredArgsConstructor
@Validated
@Slf4j
public class CategoryApiController {

	private final CategoryService categoryService;
	private final FirebaseStorageService firebaseStorageService;

	@PostMapping("/create")
	public ResponseEntity<ApiResponse<Void>> create(
			@SessionAttribute("userId") Long userId,
			@RequestBody CategoryRequestDto categoryRequestDto) {
		log.info("[POST] create: userId={}", userId);

		Long newCategoryId = categoryService.create(userId, categoryRequestDto);

		if (newCategoryId == null) {
			log.warn("Category creation failed for userId={}", userId);

			return new ResponseEntity<>(ApiResponse.failWithErrors("creation_failed", null),
					HttpStatus.BAD_REQUEST);
		}
		log.info("Category created for userId={}", userId);
		return new ResponseEntity<>(ApiResponse.ok(null), HttpStatus.CREATED);
	}

	// ユーザーに紐ずいた全件取得
	@GetMapping("")
	public ResponseEntity<ApiResponse<Object>> getAll(
			@SessionAttribute("userId") Long userId) {
		log.info("[GET] getAll: userId={}", userId);

		var categories = categoryService.getAll(userId);

		log.info("Categories retrieved: count={}", categories.size());

		// 200 OK と共に ApiResponse を返す
		return ResponseEntity.ok(ApiResponse.ok(categories));
	}

	/** プロンプト取得 */
	@GetMapping("/{id}/prompts")
	public ResponseEntity<ApiResponse<CategoryPromptResponseDto>> getPrompts(
			@PathVariable Long id) {
		log.info("[GET] getPrompts: id={}", id);

		CategoryPromptResponseDto dto = categoryService.getPrompts(id);

		if (dto == null) {
			log.warn("Category not found or forbidden: id={}", id);
			// 404 Not Found を返す
			return new ResponseEntity<>(ApiResponse.failWithErrors("not_found_or_forbidden", null),
					HttpStatus.NOT_FOUND);
		}

		log.info("Prompts retrieved: categoryId={}, prompt1={}, prompt2={}",
				dto.getCategoryId(), dto.getPrompt1(), dto.getPrompt2());

		// 200 OK と共に ApiResponse を返す
		return ResponseEntity.ok(ApiResponse.ok(dto));
	}

	// ---

	/** カテゴリ名更新 */
	@PatchMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> updateName(@PathVariable Long id,
			@RequestBody CategoryPatchRequestDto req) {
		log.info("[PATCH] updateName: id={}, request={}", id, req);

		int updatedCount = categoryService.updateName(id, req.getName());
		log.debug("updateName result: updatedCount={}", updatedCount);

		if (updatedCount == 0) {
			log.warn("Category not found or forbidden: id={}", id);
			// 404 Not Found を返す
			return new ResponseEntity<>(ApiResponse.failWithErrors("not_found_or_forbidden", null),
					HttpStatus.NOT_FOUND);
		}

		log.info("Category updated successfully: id={}", id);

		// 200 OK と共に ApiResponse を返す
		return ResponseEntity.ok(ApiResponse.ok(null));
	}

	
	// ---

	//** カテゴリ削除 */
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(
    @PathVariable Long id,
    @SessionAttribute("userId") Long userId
) {
    log.info("[DELETE] delete: id={}, userId={}", id, userId);


    // 2) 先にDB削除（トランザクション内で CASCADE まで完了させる）
    categoryService.delete(userId, id);

    //    重いので非同期推奨。ここでは try-catch 同期のパターンと、@Async版の両方を示す。
    try {
        firebaseStorageService.deleteCategoryAssetsAsync(userId, id);
    } catch (Exception e) {
        log.warn("Storage cleanup failed for userId={}, categoryId={}: {}", userId, id, e.getMessage());
        // ここで 500 を返さず 204 のまま。監視/再実行は別途ジョブで。
    }

    log.info("Category deleted: id={}", id);
    // 204 No Content は本文なし
    return ResponseEntity.noContent().build();
}

}