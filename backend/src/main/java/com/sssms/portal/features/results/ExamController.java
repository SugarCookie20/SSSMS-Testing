package com.sssms.portal.features.results;

import com.sssms.portal.shared.entity.*;
import com.sssms.portal.features.auth.*;
import com.sssms.portal.features.student.*;
import com.sssms.portal.shared.utils.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.Arrays;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ExamController {

    private final YearMetadataRepository yearRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadSchedule(@RequestParam("year") AcademicYear year, @RequestParam("file") MultipartFile file) {
        YearMetadata metadata = yearRepository.findById(year)
                .orElse(YearMetadata.builder().id(year).build());
        // Delete old file from disk before replacing
        if (metadata.getExamSchedulePdf() != null) {
            fileStorageService.deleteFile(metadata.getExamSchedulePdf());
        }
        String fileName = fileStorageService.storeFile(file);
        metadata.setExamSchedulePdf(fileName);
        yearRepository.save(metadata);
        return ResponseEntity.ok("Exam Schedule Uploaded");
    }

    @GetMapping("/student/me")
    public ResponseEntity<?> getMyExamSchedule(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();

        // 1. Fetch User and Student
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow(); // <--- This was missing

        // 2. Fetch Metadata for Student's Year
        YearMetadata metadata = yearRepository.findById(student.getAcademicYear()).orElse(null);

        if (metadata == null || metadata.getExamSchedulePdf() == null) {
            return ResponseEntity.ok(Map.of("exists", false));
        }

        return ResponseEntity.ok(Map.of("exists", true, "fileName", metadata.getExamSchedulePdf()));
    }

    @GetMapping("/classes")
    public ResponseEntity<?> getAllClasses() {
        return ResponseEntity.ok(Arrays.asList(AcademicYear.values()));
    }

    @GetMapping("/view/{fileName}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        String lower = fileName.toLowerCase();

        if (lower.endsWith(".pdf")) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else if (lower.endsWith(".png")) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else if (lower.endsWith(".gif")) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_GIF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else if (lower.endsWith(".webp")) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("image/webp"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            // Non-viewable formats (ppt, pptx, xlsx, docx, etc.) — force download
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        }
    }
}