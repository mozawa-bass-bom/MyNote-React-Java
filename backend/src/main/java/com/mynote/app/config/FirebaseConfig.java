// app/common/config/FirebaseConfig.java
package com.mynote.app.config;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

@Configuration
public class FirebaseConfig {

  @Value("${firebase.config-path}")
  private String firebaseConfigPath;

  @Value("${firebase.storage-bucket}")
  private String firebaseStorageBucket;

  /** 🟦 Firebase 用の資格情報（Bean 名を firebaseCredentials に） */
  @Bean(name = "firebaseCredentials")
  public GoogleCredentials firebaseCredentials() throws Exception {
    try (InputStream in = new ClassPathResource(firebaseConfigPath).getInputStream()) {
      return GoogleCredentials.fromStream(in);
    }
  }

  /** 🟦 FirebaseApp 初期化（ApplicationContext 起動時に1回だけ） */
  @Bean
  public FirebaseApp firebaseApp(GoogleCredentials firebaseCredentials) {
    if (FirebaseApp.getApps().isEmpty()) {
      FirebaseOptions options = FirebaseOptions.builder()
          .setCredentials(firebaseCredentials)
          .setStorageBucket(firebaseStorageBucket)
          .build();
      return FirebaseApp.initializeApp(options);
    }
    return FirebaseApp.getInstance();
  }
  @Bean
  public Storage storage(GoogleCredentials firebaseCredentials) {
    return StorageOptions.newBuilder()
        .setCredentials(firebaseCredentials)
        .build()
        .getService();
  }
  public String getFirebaseStorageBucket() { return firebaseStorageBucket; }
}
