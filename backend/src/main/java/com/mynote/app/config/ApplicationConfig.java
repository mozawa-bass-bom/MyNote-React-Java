// app/common/config/ApplicationConfig.java
package com.mynote.app.config;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.EnableAsync;

import com.google.auth.oauth2.GoogleCredentials;

@Configuration
@EnableAsync
public class ApplicationConfig {

  @Value("${gemini.credentials-path:keys/gemini-service-account.json}")
  private String geminiCredentialsPath;

  @Value("${gemini.project-id}")
  private String projectId;

  @Value("${gemini.location}")
  private String location;

  @Value("${gemini.model-id:gemini-2.0-flash}")
  private String modelId;

  /** 🟩 Vertex/Gemini や Vision で使う資格情報（Bean 名を vertexCredentials に変更） */
  @Bean(name = "vertexCredentials")
  public GoogleCredentials vertexCredentials() throws Exception {
    Resource res = new ClassPathResource(geminiCredentialsPath);
    try (InputStream in = res.getInputStream()) {
      return GoogleCredentials.fromStream(in)
          .createScoped("https://www.googleapis.com/auth/cloud-platform");
    }
  }

  public String getProjectId() { return projectId; }
  public String getLocation()  { return location; }
  public String getModelId()   { return modelId; }
}
