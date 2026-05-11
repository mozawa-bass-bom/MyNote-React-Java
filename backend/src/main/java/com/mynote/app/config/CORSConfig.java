package com.mynote.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.mynote.app.filter.AuthFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CORSConfig implements WebMvcConfigurer {

	@Value("${cors.allowed-origins:http://localhost:3000}")
	private String allowedOrigins;

	private final AuthFilter authFilter;

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOrigins(allowedOrigins.split(","))
				.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
				.allowedHeaders("*")
				.exposedHeaders("Authorization", "Content-Disposition")
				.allowCredentials(true)
				.maxAge(3600);
	}

}
