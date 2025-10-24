package com.mynote.app.api.dto.contact;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import lombok.Data;

@Data
@Valid
public class ContactRequestDto {

	@NotEmpty
	private String name;
	@NotEmpty
	private String email;
	@NotEmpty
	private String message;

}
