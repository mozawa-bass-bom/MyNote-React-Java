package com.mynote.app.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserSettings {
	private Long userId;
	private String theme;
	private String customBgColor;
	private String customBorderColor;
	private String customFontColor;
	private String customInputBgColor;
	private LocalDateTime updatedAt;
}
