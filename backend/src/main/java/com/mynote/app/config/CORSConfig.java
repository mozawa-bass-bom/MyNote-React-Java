package com.mynote.app.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.mynote.app.filter.AuthFilter;

@Configuration
public class CORSConfig implements WebMvcConfigurer {
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
				.allowedHeaders("Authorization", "Content-Type")
				.allowCredentials(true);

	}

	@Bean
	FilterRegistrationBean<AuthFilter> authFilter() {
	var bean =
	new FilterRegistrationBean<AuthFilter>(new AuthFilter());
	bean.addUrlPatterns("/api/notes/*");
	return bean;
	}
}