package com.mynote.app.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mynote.app.api.dto.nav.CategoryNavDto;
import com.mynote.app.domain.entity.Category;

@Mapper
public interface CategoryMapper {

	/**
	 * カテゴリを新規作成。
	 * - PDFアップロード時に新カテゴリを作るケース（F03-1-1）
	 * - 管理画面から追加するケース（将来的に）
	 */
	int insert(Category c);

	/**
	 * カテゴリを取得。
	 * - PDFアップロード時に新カテゴリを作るケース（F03-1-1）
	 * - 管理画面から追加するケース（将来的に）
	 */
	Category findById(@Param("id") Long id);

	//	 ユーザーIDから全件取得
	List<Category> findByUserId(@Param("userId") Long userId);

	//    ナビ生成用
	List<CategoryNavDto> selectNavByUserId(@Param("userId") Long userId);

	/**
	 * カテゴリ名を変更。
	 * - 画面G03-4（設定画面）からの編集APIで利用。
	 * - 軽量PATCH（CategoryApiController → CategoryService）。
	 */
	int updateName(@Param("id") Long id, @Param("name") String name);

	/**
	 * カテゴリに紐づく既定プロンプト（prompt1/prompt2）を更新。
	 * - G03-1（アップロード時）の「デフォルト保存」チェック時に使用。
	 * - 設定画面で既定プロンプトを編集する場合にも利用可能。
	 */
	int updatePrompts(@Param("id") Long id,
			@Param("prompt1") String p1,
			@Param("prompt2") String p2);

	/**
	 * 指定ユーザーのカテゴリを1件削除します（所有者チェックあり）。
	 * 指定した userId に紐付かないカテゴリIDを渡した場合は削除されません（0件）。
	 *
	 * @param userId 対象ユーザーID
	 * @param id     カテゴリID
	 * @return 削除件数（0 または 1）
	 */
	int deleteByCategoryIdAndUser(@Param("userId") Long userId, @Param("id") Long id);

	/**
	 * 指定ユーザーに紐づくカテゴリをすべて削除します。
	 * DBの外部キー CASCADE が有効な場合、配下のノート/ページも併せて削除されます。
	 *
	 * @param userId 対象ユーザーID
	 * @return 削除件数（削除されたカテゴリ数）
	 */
	int deleteAllByUser(@Param("userId") Long userId);

	/**
	 * カテゴリIDのみを指定して削除します（所有者チェックなし・管理者向け）。
	 * 通常のユーザーAPIからは使用しないでください。
	 *
	 * @param id カテゴリID
	 * @return 削除件数（0 または 1）
	 */
	int deleteByCategoryId(@Param("id") Long id);

	/**
	 * ユーザー毎カテゴリ数カウント。
	 */
	int countCategorysByUserId(@Param("userId") Long userId);

}
