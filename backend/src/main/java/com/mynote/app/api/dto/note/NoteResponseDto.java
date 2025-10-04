package com.mynote.app.api.dto.note;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.Data;


@Data
public class NoteResponseDto implements Serializable {
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
