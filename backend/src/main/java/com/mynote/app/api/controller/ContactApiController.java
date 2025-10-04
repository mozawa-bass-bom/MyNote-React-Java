package com.mynote.app.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.mynote.app.api.dto.ApiResponse;
import com.mynote.app.api.dto.contact.ContactRequestDto;
import com.mynote.app.api.service.contact.ContactService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contacts")
public class ContactApiController {

	private final ContactService contactService;

	// --- 問い合わせ送信エンドポイント ---
	/**
	 * private String name;
	 * private String email;
	 * private String message;
	 * をフロントから受け取る
	 * */
	@PostMapping()
	public ResponseEntity<ApiResponse<Void>> createContact(@SessionAttribute("userId") Long userId,
		@RequestBody ContactRequestDto requestDto) {
		contactService.createContact(userId, requestDto);
		return ResponseEntity.ok(ApiResponse.ok(null));
	}

}
