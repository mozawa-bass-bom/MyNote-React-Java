package com.mynote.app.domain.entity;

import lombok.Data;

@Data
public class NoteIndex {
	private Long id;
	private Long noteId;
	private Integer indexNumber;
	private Integer startIndex;
	private Integer endIndex;
	private String title;
	private String body;
}