package com.mynote.app.api.dto.auth;

import java.io.Serializable;

import lombok.Data;

/** 認証APIの成功時に返す情報（セッションへも格納） */
@Data
public class AuthUserDto implements Serializable {
	private Long userId;
	private String userName;
	private String role;
}
