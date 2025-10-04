// app/api/service/upload/FirebaseStorageService.java
package com.mynote.app.api.service.upload;

import java.io.File;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.google.cloud.storage.Storage;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseStorageService {

  private final FirebaseApp firebaseApp;
  private final Storage storage;

  @Value("${firebase.storage-bucket}")
  private String configuredBucket;

  private StorageClient storageClient() { return StorageClient.getInstance(firebaseApp); }
  private String bucket() {
    return (configuredBucket != null && !configuredBucket.isBlank())
        ? configuredBucket
        : storageClient().bucket().getName();
  }

  public record UploadedImage(String publicUrl, String bucket, String objectPath) {
    public String gsUri() { return "gs://" + bucket + "/" + objectPath; }
  }

  // ========== パス設計（users/{userId}/categories/{categoryId}/notes/{noteId}/pages/） ==========
  public String pageObjectPath(long userId, long categoryId, long noteId, int pageNo, String ext) {
    return String.format("users/%d/categories/%d/notes/%d/pages/%03d.%s",
        userId, categoryId, noteId, pageNo, (ext == null ? "png" : ext));
  }

  public UploadedImage uploadToPath(File file, String objectPath, String contentType) throws IOException {
    try (var in = new java.io.FileInputStream(file)) {
      storageClient().bucket(bucket()).create(objectPath, in, contentType);
    }
    String publicUrl = buildPublicUrl(bucket(), objectPath);
    log.debug("Uploaded: gs://{}/{} -> {}", bucket(), objectPath, publicUrl);
    return new UploadedImage(publicUrl, bucket(), objectPath);
  }

  // ========== ノートのページ画像アップロード ==========
  public UploadedImage uploadNotePageImage(long userId, long categoryId, long noteId, int pageNo, File imageFile)
      throws IOException {
    String ext  = detectExt(imageFile.getName());
    String path = pageObjectPath(userId, categoryId, noteId, pageNo, ext);
    return uploadToPath(imageFile, path, detectContentType(imageFile));
  }

//========== まとめて削除（非同期・例外吸収） ==========
@Async
public void deleteUserAssetsAsync(long userId) {
   final String prefix = "users/" + userId + "/";
   try {
       log.info("[GCS] async delete start prefix={}", prefix);
       deleteByPrefix(prefix);
       log.info("[GCS] async delete done  prefix={}", prefix);
   } catch (Exception e) {
       log.warn("[GCS] async delete failed prefix={} : {}", prefix, e.getMessage(), e);
   }
}

@Async
public void deleteCategoryAssetsAsync(long userId, long categoryId) {
   final String prefix = "users/" + userId + "/categories/" + categoryId + "/";
   try {
       log.info("[GCS] async delete start prefix={}", prefix);
       deleteByPrefix(prefix);
       log.info("[GCS] async delete done  prefix={}", prefix);
   } catch (Exception e) {
       log.warn("[GCS] async delete failed prefix={} : {}", prefix, e.getMessage(), e);
   }
}

@Async
public void deleteNoteAssetsAsync(long userId, long categoryId, long noteId) {
   final String prefix = "users/" + userId + "/categories/" + categoryId + "/notes/" + noteId + "/";
   try {
       log.info("[GCS] async delete start prefix={}", prefix);
       deleteByPrefix(prefix);
       log.info("[GCS] async delete done  prefix={}", prefix);
   } catch (Exception e) {
       log.warn("[GCS] async delete failed prefix={} : {}", prefix, e.getMessage(), e);
   }
}


  public void deleteByPrefix(String prefix) {
    var page = storage.list(bucket(),
        Storage.BlobListOption.prefix(prefix),
        Storage.BlobListOption.pageSize(1000));
    for (var blob : page.iterateAll()) {
      try { storage.delete(blob.getBlobId()); }
      catch (Exception e) {
        log.warn("Delete failed: {}/{} - {}", blob.getBucket(), blob.getName(), e.getMessage());
      }
    }
  }

  // ========== helpers ==========
  private static String buildPublicUrl(String bucket, String objectPath) {
    return "https://firebasestorage.googleapis.com/v0/b/" + bucket + "/o/"
        + java.net.URLEncoder.encode(objectPath, java.nio.charset.StandardCharsets.UTF_8)
        + "?alt=media";
  }
  public static String detectExt(String filename) {
    String n = filename == null ? "" : filename.toLowerCase();
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpg";
    if (n.endsWith(".gif")) return "gif";
    if (n.endsWith(".png")) return "png";
    return "png";
  }
  public static String detectContentType(File f) {
    String n = f.getName().toLowerCase();
    if (n.endsWith(".png")) return "image/png";
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
    if (n.endsWith(".gif")) return "image/gif";
    if (n.endsWith(".pdf")) return "application/pdf";
    return "application/octet-stream";
  }
}
