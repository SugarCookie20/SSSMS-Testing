package com.sssms.portal.features.timetable;

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

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ScheduleController {

    private final YearMetadataRepository yearRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    // ===================== UPLOAD ENDPOINTS (Faculty/Admin) =====================

    @PostMapping("/upload/college-calendar")
    public ResponseEntity<?> uploadCollegeCalendar(
            @RequestParam("year") AcademicYear year,
            @RequestParam("file") MultipartFile file) {
        YearMetadata metadata = yearRepository.findById(year)
                .orElse(YearMetadata.builder().id(year).build());
        // Delete old file from disk before replacing
        if (metadata.getCollegeCalendarPdf() != null) {
            fileStorageService.deleteFile(metadata.getCollegeCalendarPdf());
        }
        String fileName = fileStorageService.storeFile(file);
        metadata.setCollegeCalendarPdf(fileName);
        yearRepository.save(metadata);
        return ResponseEntity.ok("College Calendar Uploaded for " + year);
    }

    @PostMapping("/upload/academic-schedule")
    public ResponseEntity<?> uploadAcademicSchedule(
            @RequestParam("year") AcademicYear year,
            @RequestParam("file") MultipartFile file) {
        YearMetadata metadata = yearRepository.findById(year)
                .orElse(YearMetadata.builder().id(year).build());
        // Delete old file from disk before replacing
        if (metadata.getAcademicSchedulePdf() != null) {
            fileStorageService.deleteFile(metadata.getAcademicSchedulePdf());
        }
        String fileName = fileStorageService.storeFile(file);
        metadata.setAcademicSchedulePdf(fileName);
        yearRepository.save(metadata);
        return ResponseEntity.ok("Academic Schedule Uploaded for " + year);
    }

    // ===================== DELETE ENDPOINTS (Faculty/Admin) =====================

    @DeleteMapping("/college-calendar/{year}")
    public ResponseEntity<?> deleteCollegeCalendar(@PathVariable AcademicYear year) {
        YearMetadata metadata = yearRepository.findById(year).orElse(null);
        if (metadata != null) {
            metadata.setCollegeCalendarPdf(null);
            yearRepository.save(metadata);
        }
        return ResponseEntity.ok("College Calendar removed for " + year);
    }

    @DeleteMapping("/academic-schedule/{year}")
    public ResponseEntity<?> deleteAcademicSchedule(@PathVariable AcademicYear year) {
        YearMetadata metadata = yearRepository.findById(year).orElse(null);
        if (metadata != null) {
            metadata.setAcademicSchedulePdf(null);
            yearRepository.save(metadata);
        }
        return ResponseEntity.ok("Academic Schedule removed for " + year);
    }

    @DeleteMapping("/timetable/{year}")
    public ResponseEntity<?> deleteTimetable(@PathVariable AcademicYear year) {
        YearMetadata metadata = yearRepository.findById(year).orElse(null);
        if (metadata != null) {
            metadata.setTimetablePdf(null);
            yearRepository.save(metadata);
        }
        return ResponseEntity.ok("Timetable removed for " + year);
    }

    @DeleteMapping("/exam-schedule/{year}")
    public ResponseEntity<?> deleteExamSchedule(@PathVariable AcademicYear year) {
        YearMetadata metadata = yearRepository.findById(year).orElse(null);
        if (metadata != null) {
            metadata.setExamSchedulePdf(null);
            yearRepository.save(metadata);
        }
        return ResponseEntity.ok("Exam Schedule removed for " + year);
    }

    // ===================== STUDENT VIEW ENDPOINTS =====================

    @GetMapping("/student/me")
    public ResponseEntity<?> getMySchedules(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow();

        YearMetadata metadata = yearRepository.findById(student.getAcademicYear()).orElse(null);

        Map<String, Object> result = new HashMap<>();
        if (metadata != null) {
            result.put("collegeCalendar", metadata.getCollegeCalendarPdf() != null
                    ? Map.of("exists", true, "fileName", metadata.getCollegeCalendarPdf())
                    : Map.of("exists", false));
            result.put("academicSchedule", metadata.getAcademicSchedulePdf() != null
                    ? Map.of("exists", true, "fileName", metadata.getAcademicSchedulePdf())
                    : Map.of("exists", false));
        } else {
            result.put("collegeCalendar", Map.of("exists", false));
            result.put("academicSchedule", Map.of("exists", false));
        }
        return ResponseEntity.ok(result);
    }

    // ===================== ADMIN/FACULTY: Status per year =====================

    @GetMapping("/status")
    public ResponseEntity<?> getAllScheduleStatus() {
        List<Map<String, Object>> result = Arrays.stream(AcademicYear.values()).map(year -> {
            YearMetadata metadata = yearRepository.findById(year).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("year", year.name());
            map.put("timetable", metadata != null && metadata.getTimetablePdf() != null);
            map.put("timetableFile", metadata != null ? metadata.getTimetablePdf() : null);
            map.put("examSchedule", metadata != null && metadata.getExamSchedulePdf() != null);
            map.put("examScheduleFile", metadata != null ? metadata.getExamSchedulePdf() : null);
            map.put("collegeCalendar", metadata != null && metadata.getCollegeCalendarPdf() != null);
            map.put("collegeCalendarFile", metadata != null ? metadata.getCollegeCalendarPdf() : null);
            map.put("academicSchedule", metadata != null && metadata.getAcademicSchedulePdf() != null);
            map.put("academicScheduleFile", metadata != null ? metadata.getAcademicSchedulePdf() : null);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ===================== VIEW FILE =====================

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
