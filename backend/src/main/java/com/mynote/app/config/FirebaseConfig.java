// app/common/config/FirebaseConfig.java
package com.mynote.app.config;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import jakarta.annotation.PostConstruct;

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

  @Value("${gemini.project-id}")
  private String projectId;

  @Value("${gemini.location}")
  private String location;

  /** Firebase 用の資格情報 */
  @Bean(name = "firebaseCredentials")
  public GoogleCredentials firebaseCredentials() throws Exception {
    try (InputStream in = new ClassPathResource(firebaseConfigPath).getInputStream()) {
      return GoogleCredentials.fromStream(in);
    }
  }

  /** Firebase 初期化 */
  @Bean
  public FirebaseApp firebaseApp(GoogleCredentials firebaseCredentials) throws Exception {
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
    return StorageOptions.newBuilder().setCredentials(firebaseCredentials).build().getService();
  }

  /** 起動時に ADC を環境変数へセット（VertexAI 2 引数コンストラクタ用） */
  @PostConstruct
  public void setupAdcForVertex() throws Exception {
    // 既に設定済みなら何もしない
    if (System.getenv("GOOGLE_APPLICATION_CREDENTIALS") != null ||
        System.getProperty("GOOGLE_APPLICATION_CREDENTIALS") != null) {
      return;
    }
    // クラスパスの SA JSON を temp に書き出して指す
    try (InputStream in = new ClassPathResource(firebaseConfigPath).getInputStream()) {
      Path tmp = Files.createTempFile("gcp-sa-", ".json");
      Files.copy(in, tmp, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
      // Windows でも OK なように System property 経由で設定
      System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", tmp.toAbsolutePath().toString());
    }
  }

  public String getFirebaseStorageBucket() { return firebaseStorageBucket; }
}
