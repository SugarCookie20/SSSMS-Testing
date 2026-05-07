package com.sssms.portal.shared.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    /** Root of all uploads — e.g. /uploads (container) or ./uploads (local dev) */
    private final Path resourceStorageLocation;

    /** Subdirectory for profile photos — e.g. /uploads/profile_pictures */
    private final Path profileStorageLocation;

    public FileStorageService(
            @Value("${file.upload-dir.resources}") String resourceUploadDir,
            @Value("${file.upload-dir.profiles}") String profileUploadDir) {

        this.resourceStorageLocation = Paths.get(resourceUploadDir).toAbsolutePath().normalize();
        this.profileStorageLocation  = Paths.get(profileUploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.resourceStorageLocation);
            Files.createDirectories(this.profileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directories.", ex);
        }
    }

    // ==================== ACADEMIC RESOURCES ====================

    /** Store an academic resource file (PDFs, timetables, notices, etc.) */
    public String storeFile(MultipartFile file) {
        return store(file, resourceStorageLocation);
    }

    /** Load an academic resource file for download/view */
    public Resource loadFileAsResource(String fileName) {
        return load(fileName, resourceStorageLocation);
    }

    /** Delete an academic resource file */
    public boolean deleteFile(String fileName) {
        return delete(fileName, resourceStorageLocation);
    }

    // ==================== PROFILE PHOTOS ====================

    /** Store a user profile photo in the profile_pictures subdirectory */
    public String storeProfilePhoto(MultipartFile file) {
        return store(file, profileStorageLocation);
    }

    /** Load a profile photo for serving to the UI */
    public Resource loadProfilePhotoAsResource(String fileName) {
        return load(fileName, profileStorageLocation);
    }

    /** Delete a profile photo (e.g. when replacing with a new one) */
    public boolean deleteProfilePhoto(String fileName) {
        return delete(fileName, profileStorageLocation);
    }

    // ==================== INTERNAL HELPERS ====================

    private String store(MultipartFile file, Path location) {
        String originalFileName = file.getOriginalFilename();
        String ext = (originalFileName != null && originalFileName.contains("."))
                ? originalFileName.substring(originalFileName.lastIndexOf("."))
                : "";
        String fileName = UUID.randomUUID().toString() + ext;
        try {
            Path targetLocation = location.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    private Resource load(String fileName, Path location) {
        try {
            Path filePath = location.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }

    private boolean delete(String fileName, Path location) {
        try {
            Path filePath = location.resolve(fileName).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + fileName, ex);
        }
    }
}