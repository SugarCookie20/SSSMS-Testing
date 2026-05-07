package com.sssms.portal.features.timetable;

import com.sssms.portal.shared.entity.*;
import com.sssms.portal.features.auth.*;
import com.sssms.portal.features.student.*;
import com.sssms.portal.features.faculty.*;
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

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TimetableController {

    private final YearMetadataRepository yearRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorageService;

    @PostMapping("/upload/class")
        public ResponseEntity<?> uploadClassTimetable(@RequestParam("year") AcademicYear year, @RequestParam("file") MultipartFile file) {
            YearMetadata metadata = yearRepository.findById(year)
                    .orElse(YearMetadata.builder().id(year).build());
            // Delete old file from disk before replacing
            if (metadata.getTimetablePdf() != null) {
                fileStorageService.deleteFile(metadata.getTimetablePdf());
            }
            String fileName = fileStorageService.storeFile(file);
            metadata.setTimetablePdf(fileName);
            yearRepository.save(metadata);

            return ResponseEntity.ok("Timetable Uploaded for " + year);
        }


    @PostMapping("/upload/faculty")
    public ResponseEntity<?> uploadFacultyTimetable(@RequestParam("facultyId") Long facultyId, @RequestParam("file") MultipartFile file) {
        Faculty faculty = facultyRepository.findById(facultyId).orElseThrow();
        // Delete old file from disk before replacing
        if (faculty.getTimetablePdf() != null) {
            fileStorageService.deleteFile(faculty.getTimetablePdf());
        }
        String fileName = fileStorageService.storeFile(file);
        faculty.setTimetablePdf(fileName);
        facultyRepository.save(faculty);
        return ResponseEntity.ok("Faculty Timetable Uploaded");
    }

    @GetMapping("/student/me")
        public ResponseEntity<?> getMyClassTimetable(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) return ResponseEntity.status(401).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            Student student = studentRepository.findById(user.getUserId()).orElseThrow();

            YearMetadata metadata = yearRepository.findById(student.getAcademicYear()).orElse(null);

            if (metadata == null || metadata.getTimetablePdf() == null) {
                return ResponseEntity.ok(Map.of("exists", false));
            }

            return ResponseEntity.ok(Map.of("exists", true, "fileName", metadata.getTimetablePdf()));
        }

    @GetMapping("/faculty/me")
    public ResponseEntity<?> getMyPersonalTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Faculty faculty = facultyRepository.findById(user.getUserId()).orElseThrow();

        if (faculty.getTimetablePdf() == null) return ResponseEntity.ok(Map.of("exists", false));

        return ResponseEntity.ok(Map.of("exists", true, "fileName", faculty.getTimetablePdf()));
    }

    @GetMapping("/view/{fileName}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        String lower = fileName.toLowerCase();

        // Viewable inline: PDF and common images
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