package com.mynote.app.domain.entity;

import lombok.Data;

@Data
public class NotePage {
	private Long id;
	private Long noteId;
	private Integer pageNumber;
	private String firebasePublicUrl;
	private String firebaseAdminPath;
	private String extractedText;
}