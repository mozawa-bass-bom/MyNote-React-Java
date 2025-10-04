package com.mynote.app.domain.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mynote.app.domain.entity.UserPassword;

@Mapper
public interface UserPasswordMapper {
    UserPassword findByUserId(@Param("userId") Long userId);
    int insert(UserPassword userPassword);
    int update(UserPassword userPassword);
}
