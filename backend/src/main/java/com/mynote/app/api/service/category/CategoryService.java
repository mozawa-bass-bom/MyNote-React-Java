package com.mynote.app.api.service.category;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.category.CategoryPromptResponseDto;
import com.mynote.app.api.dto.category.CategoryRequestDto;
import com.mynote.app.api.dto.category.CategoryResponseDto;
import com.mynote.app.domain.entity.Category;
import com.mynote.app.domain.mapper.CategoryMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

 private final CategoryMapper categoryMapper;

 /**
  * 新しいカテゴリーを作成し、DBに永続化する。
  * 
  * @param userId カテゴリーを作成するユーザーのID
  * @param categoryRequestDto カテゴリー情報を含むDTO
  * @return 登録が成功した場合に生成されたカテゴリID (Long)、失敗した場合に null
  */
 @Transactional(rollbackFor = Exception.class)
 public Long create(Long userId , CategoryRequestDto categoryRequestDto) {
     
     try {
         log.info("Attempting to create category for userId={}", userId);

         Category category = new Category();
         category.setUserId(userId);
         category.setName(categoryRequestDto.getName());
         category.setPrompt1(categoryRequestDto.getPrompt1());
         category.setPrompt2(categoryRequestDto.getPrompt2());
         
         // データの永続化処理を実行 (category.getId()にDBで生成されたIDがセットされる)
         categoryMapper.insert(category);
         
         Long newId = category.getId();
         log.debug("Category created successfully with id={} for userId={}", newId, userId);
         
         // 💡 成功した場合、生成されたIDを返す
         return newId;
         
     } catch (DataIntegrityViolationException e) {
         // 例: カテゴリ名の重複（ユーザーIDとカテゴリ名の複合ユニーク制約など）
         log.warn("Category creation failed due to data integrity violation (e.g., duplicate name): userId={}", userId, e);

         // 💡 失敗した場合、nullを返す
         return null; 
     } catch (Exception e) {
         // その他の予期せぬエラー
         log.error("An unexpected error occurred during category creation: userId={}", userId, e);

         // 💡 失敗した場合、nullを返す
         return null;
     }
 }
 
 /**
  * ユーザーに紐づいた全てのカテゴリを取得する。
  * 💡 戻り値を Entityの<Category>から<CategoryResponseDto> に詰め替え
  * 全く一緒だけど一応やってます。
  *
  * @param userId ユーザーID
  * @return カテゴリのDTOリスト
  */
 @Transactional(readOnly = true)
 public List<CategoryResponseDto> getAll(Long userId) {
     log.debug("Service: getAll called for userId={}", userId);
     
     List<Category> categories = categoryMapper.findByUserId(userId);
     
     // 💡 Entity (Category) から DTO (CategoryResponseDto) への変換
     return categories.stream()
         .map(this::toResponseDto)
         .collect(Collectors.toList());
 }
 
 // 💡 変換用のプライベートメソッド
 private CategoryResponseDto toResponseDto(Category category) {
     CategoryResponseDto dto = new CategoryResponseDto();
     dto.setId(category.getId());
     dto.setName(category.getName());
     dto.setPrompt1(category.getPrompt1());
     dto.setPrompt2(category.getPrompt2());
     dto.setCreatedAt(category.getCreatedAt());
     dto.setUpdatedAt(category.getUpdatedAt());
     // 💡 userId はDTOにセットしない
     return dto;
 }
 
 
 /**
  * カテゴリIDを指定してプロンプト情報を取得する。
  * 存在しない、または所有者でない場合は null を返す。
  *
  * @param userId リクエスト元のユーザーID
  * @param id カテゴリID
  * @return プロンプト情報DTO。見つからない場合は null
  */
 @Transactional(readOnly = true)
 public CategoryPromptResponseDto getPrompts(Long userId, Long id) {
     log.debug("Service: getPrompts called with userId={}, id={}", userId, id);
     
     Category cat = categoryMapper.findById(id);

     if (cat == null || !cat.getUserId().equals(userId)) {
         return null; // カテゴリが存在しない、または所有者が異なる
     }

     var dto = new CategoryPromptResponseDto();
     dto.setCategoryId(cat.getId());
     dto.setPrompt1(cat.getPrompt1());
     dto.setPrompt2(cat.getPrompt2());

     return dto;
 }

 /**
  * カテゴリ名を更新する。
  *
  * @param userId リクエスト元のユーザーID
  * @param id 更新対象のカテゴリID
  * @param name 新しいカテゴリ名
  * @return 更新件数 (1:成功, 0:失敗/見つからない)
  */
 @Transactional
 public int updateName(Long userId, Long id, String name) {
     log.debug("Service: updateName called with userId={}, id={}, name={}", userId, id, name);
     
     // 所有権チェック
     Category cat = categoryMapper.findById(id);
     if (cat == null || !cat.getUserId().equals(userId)) {
         return 0;
     }
     
     return categoryMapper.updateName(id, name);
 }


 /**
  * カテゴリ名を更新する。
  *
  * @param id 更新対象のカテゴリID
  * @param name 新しいカテゴリ名
  * @return 更新件数 (1:成功, 0:失敗/見つからない)
  */
 @Transactional
 public int  updatePrompts(Long userId ,Long id, String prompt1, String prompt2) {
     log.debug("Service: updateName called with id={},prompt1={},prompt2={}",id, prompt1, prompt2);
     
     // データの永続化処理を実行
     int updatedCount = categoryMapper.updatePrompts(userId,id, prompt1, prompt2);
     
     return updatedCount;
 }
 
 /**
  * カテゴリを削除する。
  *
  * @param id 削除対象のカテゴリID
  */

 @Transactional
 public void delete(Long userId, Long id) {
     log.debug("CategoryService.delete userId={}, id={}", userId, id);
     int rows = categoryMapper.deleteByCategoryIdAndUser(userId, id);
     if (rows == 0) {
      
         throw new IllegalArgumentException("Category not found or not owned by user.");
     }
     // ここでDBのFKに ON DELETE CASCADE を設定しておけば

 }

}