package com.mynote.app.api.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mynote.app.api.dto.ApiResponse;
import com.mynote.app.api.dto.auth.AuthLoginResponseDto;
import com.mynote.app.api.dto.auth.AuthUserDto;
import com.mynote.app.api.dto.auth.AvailabilityCheckRequest;
import com.mynote.app.api.dto.auth.LoginUser;
import com.mynote.app.api.dto.auth.RegisterUser;
import com.mynote.app.api.dto.nav.NavTreeDto;
import com.mynote.app.api.service.auth.AuthService;
import com.mynote.app.api.service.nav.NavService;
import com.mynote.app.util.TokenUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthApiController {

	private final AuthService authService;
	private final NavService navService;
	private final HttpSession session;

	@PostMapping("/login")
	public ResponseEntity<AuthLoginResponseDto> login(@RequestBody LoginUser loginUser) {

		// 1. 認証チェック
		AuthUserDto user = authService.getAuthUser(loginUser.getUserName(), loginUser.getPassword());

		if (user == null) {
			return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
		}

		// 2. Nav情報の取得
		Long userId = user.getUserId();
		NavTreeDto navTree = navService.getNavTree(userId); // NavServiceから取得

		// 3. トークン生成とセッション保存
		String token = TokenUtil.generateToken(user.getUserName(), user.getRole());
		session.setAttribute("userId", userId);        // Long
		session.setAttribute("userName", user.getUserName());    // String
		session.setAttribute("role", user.getRole());            // String
		session.setAttribute("jwt", token);                          

		// 4. レスポンスDTOの作成
		AuthLoginResponseDto response = new AuthLoginResponseDto(
				user.getUserName(),
				userId.toString(),
				token,
				navTree // Nav情報をレスポンスに含める
		);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}
	
	 /**
	     * ユーザーネームとEmailの重複チェック。
	     * userName または email のいずれか、または両方をクエリパラメータとして受け取り、
	     * それぞれの利用可能性をチェックして返します。
	     * 
	     * 例:
	     * /api/auth/availability?userName=johndoe
	     */
	 @PostMapping("/availability")
	    public ResponseEntity<ApiResponse<Map<String, Boolean>>> availability(
	            @RequestBody AvailabilityCheckRequest req) {
		    String userName = req.userName() == null ? null : req.userName().trim();
		    String email    = req.email()    == null ? null : req.email().trim().toLowerCase();

		    // 少なくともどちらか必須
		    if ((userName == null || userName.isEmpty()) && (email == null || email.isEmpty())) {
		        return ResponseEntity.badRequest().body(
		            com.mynote.app.api.dto.ApiResponse.failWithErrors("at_least_one_of_userName_or_email_is_required", null)
		        );
		    }

		    var result = new LinkedHashMap<String, Boolean>(2);
		    if (userName != null && !userName.isEmpty()) {
		        result.put("userNameAvailable", authService.isUserNameAvailable(userName));
		    }
		    if (email != null && !email.isEmpty()) {
		        result.put("emailAvailable", authService.isEmailAvailable(email));
		    }
		    
		    return ResponseEntity.ok(ApiResponse.ok(result));
	    }
	 
	 
	 
	@PostMapping("/register")
	public ResponseEntity<String> register(@RequestBody RegisterUser newUser) {
		boolean success = authService.registerUser(newUser.getUserName(), newUser.getPassword(), newUser.getEmail());
		if (success) {
			return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Username already exists", HttpStatus.CONFLICT);
		}
	}

	@GetMapping("/logout")
	public ResponseEntity<String> logout() {
		session.invalidate();
		return new ResponseEntity<>("logout: invalidated session",
				HttpStatus.OK);
	}
}