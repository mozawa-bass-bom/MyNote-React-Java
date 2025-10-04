package com.mynote.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@MapperScan("com.mynote.app.domain.mapper")
@SpringBootApplication
@EnableAsync
public class MyNoteApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyNoteApplication.class, args);
	}

}
