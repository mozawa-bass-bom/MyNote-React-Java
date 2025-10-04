package com.mynote.app.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.mynote.app.api.dto.admin.ContactResponseDto;
import com.mynote.app.domain.entity.Contact;

@Mapper
public interface ContactMapper {
	void insert(Contact c);

	int delete(Long id);

	List<ContactResponseDto> findAdminContacts();

	long countContacts();
}
