package com.sssms.portal.features.auth;

import com.sssms.portal.shared.utils.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class ProfilePhotoController {

    private final FileStorageService fileStorageService;

    @GetMapping("/profile/{fileName}")
    public ResponseEntity<Resource> serveProfilePhoto(
            @PathVariable String fileName,
            WebRequest webRequest) {

        // ETag is the filename itself — it's a UUID, unique per upload.
        // If the client sends If-None-Match matching this, return 304 instantly.
        String eTag = "\"" + fileName + "\"";
        if (webRequest.checkNotModified(eTag)) {
            return ResponseEntity.status(304).build();
        }

        Resource resource = fileStorageService.loadProfilePhotoAsResource(fileName);

        // Determine content type from file extension
        String contentType = "application/octet-stream";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (lower.endsWith(".png"))  contentType = "image/png";
        else if (lower.endsWith(".gif"))  contentType = "image/gif";
        else if (lower.endsWith(".webp")) contentType = "image/webp";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .eTag(fileName)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
