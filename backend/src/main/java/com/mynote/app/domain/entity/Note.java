package com.mynote.app.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * インサート時はid, userSeqNo,createdAt, updatedAtはnullにすること
 */

@Data
public class Note {
	private Long id;
	private Long userId;
	private Long categoryId;
	private Integer userSeqNo;
	private String title;
	private String description;
	private String originalFilename;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}