// app/common/config/ApplicationConfig.java
package com.mynote.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import com.google.cloud.vertexai.VertexAI;

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

  @Bean(destroyMethod = "close")
  public VertexAI vertexAI(
      @Value("${gemini.project-id}") String projectId,
      @Value("${gemini.location}") String location
  ) {
    // 認証は ADC（GOOGLE_APPLICATION_CREDENTIALS か、起動時にSystem.setProperty）を利用
    return new VertexAI(projectId, location);
  }
  public String getProjectId() { return projectId; }
  public String getLocation()  { return location; }
  public String getModelId()   { return modelId; }
}
