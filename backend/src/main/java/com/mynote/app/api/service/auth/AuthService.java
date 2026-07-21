package com.mynote.app.api.service.auth;

import static java.time.LocalDateTime.*;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mynote.app.api.dto.auth.AuthUserDto;
import com.mynote.app.api.dto.auth.LoginUser;
import com.mynote.app.domain.entity.User;
import com.mynote.app.domain.entity.UserPassword;
import com.mynote.app.domain.mapper.UserMapper;
import com.mynote.app.domain.mapper.UserPasswordMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 認証ロジックを管理するサービスクラス。
 * ユーザー名とパスワードを検証し、認証済みユーザー情報（JWT発行用）を返す責務を持つ。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserMapper userMapper;
	private final UserPasswordMapper userPasswordMapper;

	/**
	 * ユーザー名と入力されたパスワードを検証し、認証済みユーザーのDTOを返します。
	
	 * @param userName ログイン試行時のユーザー名
	 * @param loginPass ログイン試行時の平文パスワード
	 * @return 認証成功時はユーザー情報を含む {@link UserDto}、認証失敗時は {@code null}
	 */
	public AuthUserDto getAuthUser(String userName, String loginPass) {

		LoginUser loginUser = userMapper.findLoginUserByUserName(userName);

		if (loginUser == null) {
			return null;
		}

		try {
			if (!BCrypt.checkpw(loginPass, loginUser.getPassword())) {
				System.out.println("チェックミス: パスワード不一致");
				return null;
			}
		} catch (Exception e) {
			System.out.println("チェック中にエラー: " + e.getMessage());
			e.printStackTrace();
			return null;
		}

		AuthUserDto authUserDto = new AuthUserDto();
		authUserDto.setUserId(loginUser.getUserId());
		authUserDto.setUserName(loginUser.getUserName());
		authUserDto.setRole(loginUser.getRole());

		return authUserDto;
	}

	/**
	* ユーザーネームとEmailの重複チェック。
	* @param userName チェックするユーザーネーム
	* @param email チェックするEmail
	* @return 利用可能な場合に true、既に存在する場合に false
	*/
	@Transactional(readOnly = true)
	public boolean isUserNameAvailable(String userName) {
		if (userName == null || userName.isBlank())
			return false;
		return !userMapper.existsByUserName(userName);
	}

	@Transactional(readOnly = true)
	public boolean isEmailAvailable(String email) {
		if (email == null || email.isBlank())
			return false;
		return !userMapper.existsByUserEmail(email);
	}

	 @Transactional(rollbackFor = Exception.class)
	 public boolean deleteUser( Long userId ) {
		 try {
			 int deletedCount = userMapper.deleteUser(userId);
			 return deletedCount > 0;
		 } catch (Exception e) {
			 log.error("An unexpected error occurred during user deletion: userId={}", userId, e);
			 return false;
		 }
	 }
	
	/**
	* ユーザーとパスワード情報を登録する。
	*
	* @param userName ログイン登録時のユーザー名
	* @param loginPass ログイン登録時の平文パスワード
	* @param email ログイン登録時のメールアドレス
	* @return 登録が成功した場合に true、失敗した場合に false
	*/
	@Transactional // 💡 複数テーブルへの書き込みはトランザクションで囲む
	public boolean registerUser(String userName, String loginPass, String email) {

		// 1. パスワードのハッシュ化
		String hashedPass = BCrypt.hashpw(loginPass, BCrypt.gensalt());

		try {
			log.info("Attempting to register new user: {}", userName);

			// 2. Userエンティティの作成と登録 (usersテーブル)
			User user = new User();
			user.setUserName(userName);
			user.setEmail(email);
			user.setRole("USER");
			user.setCreatedAt(now());

			// 登録実行。user.getId() にIDがセットされる。
			userMapper.insertUser(user);

			// 3. UserPasswordエンティティの作成と登録 (user_passwordsテーブル)
			UserPassword userPassword = new UserPassword();

			// 生成されたIDを設定
			userPassword.setUserId(user.getId());
			userPassword.setPasswordHash(hashedPass);

			// パスワード情報の登録を実行
			userPasswordMapper.insert(userPassword);

			log.info("User registration successful for user: {}", userName);
			return true;

		} catch (DataIntegrityViolationException e) {
			// 例: userNameの重複、NULL制約違反など、DBの制約違反
			log.warn("Registration failed due to data integrity violation (e.g., duplicate username/email): {}",
					userName, e);

			return false;
		} catch (Exception e) {
			// その他の予期せぬエラー (DB接続エラー、処理エラーなど)
			log.error("An unexpected error occurred during user registration: {}", userName, e);

			return false;
		}
	}
}