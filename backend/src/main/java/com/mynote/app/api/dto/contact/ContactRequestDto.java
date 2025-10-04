package com.mynote.app.api.dto.contact;

import jakarta.validation.Valid;

import lombok.Data;

@Data
@Valid
public class ContactRequestDto {

	private String name;
	private String email;
	private String message;

}
