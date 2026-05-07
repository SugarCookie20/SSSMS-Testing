package com.sssms.portal.features.student;
import com.sssms.portal.features.results.GradingService;
import com.sssms.portal.features.results.AcademicMarks;
import com.sssms.portal.features.results.ExamType;
import com.sssms.portal.features.results.AcademicMarksRepository;

import com.sssms.portal.shared.entity.*;
import com.sssms.portal.features.auth.*;
import com.sssms.portal.features.results.*;
import com.sssms.portal.features.timetable.*;
import com.sssms.portal.features.resources.*;
import com.sssms.portal.features.fees.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ResourceRepository resourceRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final ExamResultRepository resultRepository;
    private final StudentMarkRepository studentMarkRepository;
    private final GradingService gradingService;
    private final FeeRepository feeRepository;
    private final FeeReminderRepository feeReminderRepository;
    private final AcademicMarksRepository academicMarksRepository;

    @GetMapping("/my-attendance")
    public ResponseEntity<?> getMyAttendance(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String year) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        AcademicYear forYear = (year != null && !year.isEmpty()) ? AcademicYear.valueOf(year) : null;
        return ResponseEntity.ok(studentService.getMyAttendance(user.getUserId(), forYear));
    }

    @GetMapping("/archived-years")
    public ResponseEntity<?> getArchivedYears(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow();

        // Return all years before the student's current year that have data
        AcademicYear currentYear = student.getAcademicYear();
        AcademicYear[] allYears = AcademicYear.values();
        List<String> archived = new java.util.ArrayList<>();
        for (AcademicYear y : allYears) {
            if (y.ordinal() < currentYear.ordinal()) {
                // Check if there's any data for this year (marks or attendance)
                boolean hasMarks = academicMarksRepository.findByStudentId(student.getId()).stream()
                        .anyMatch(m -> m.getSubject().getAcademicYear() == y);
                if (hasMarks) {
                    archived.add(y.name());
                }
            }
        }
        return ResponseEntity.ok(archived);
    }

    @GetMapping("/my-results")
    public ResponseEntity<?> getMyResults(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow();

        List<ExamResult> results = resultRepository.findByStudentIdOrderBySemesterAsc(student.getId());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/my-assessments")
    public ResponseEntity<?> getMyAssessments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String year) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow();

        AcademicYear targetYear = (year != null && !year.isEmpty())
                ? AcademicYear.valueOf(year) : student.getAcademicYear();

        // Fetch from AcademicMarks table, filtered by target year
        List<AcademicMarks> marks = academicMarksRepository.findByStudentId(student.getId()).stream()
                .filter(m -> m.getSubject().getAcademicYear() == targetYear)
                .collect(Collectors.toList());

        List<Map<String, Object>> response = marks.stream().map(m -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", m.getId());
            map.put("subjectName", m.getSubject().getName());
            map.put("subjectCode", m.getSubject().getCode());
            map.put("examType", formatExamType(m.getExamType()));
            map.put("obtained", m.getMarksObtained());
            map.put("max", m.getMaxMarks());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private String formatExamType(ExamType type) {
        switch (type) {
            case UNIT_TEST_1: return "Unit Test 1";
            case UNIT_TEST_2: return "Unit Test 2";
            case UNIT_TEST_3: return "Unit Test 3";
            case ASSIGNMENT: return "Assignment";
            case JURY: return "Jury";
            case THEORY_ESE: return "Theory ESE";
            case PRACTICAL_ESE: return "Practical ESE";
            case SESSIONAL_ESE: return "Sessional ESE";
            default: return type.name();
        }
    }

    @GetMapping("/profile")
        public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) return ResponseEntity.status(401).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            return ResponseEntity.ok(studentService.getProfile(user.getUserId()));
    }

    @GetMapping("/resources/{subjectCode}")
    public ResponseEntity<?> getResourcesForSubject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String subjectCode
    ) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        SubjectAllocation allocation = allocationRepository.findAll().stream()
                .filter(a -> a.getSubject().getCode().equalsIgnoreCase(subjectCode))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Subject Code mismatch"));

        List<AcademicResource> resources = resourceRepository.findByAllocationId(allocation.getId());

        List<Map<String, Object>> response = resources.stream().map(r -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("title", r.getTitle());
            map.put("fileName", r.getFileName());
            map.put("date", r.getUploadDate());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/report-card")
        public ResponseEntity<?> getReportCard(
                @AuthenticationPrincipal UserDetails userDetails,
                @RequestParam(required = false) String year) {
            if (userDetails == null) return ResponseEntity.status(401).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            AcademicYear forYear = (year != null && !year.isEmpty()) ? AcademicYear.valueOf(year) : null;
            return ResponseEntity.ok(gradingService.generateReportCard(user.getUserId(), forYear));
        }

    @GetMapping("/scorecard")
    public ResponseEntity<?> getCumulativeScorecard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String year) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow();

        AcademicYear targetYear = (year != null && !year.isEmpty())
                ? AcademicYear.valueOf(year) : null;

        // Get report card data (calculated marks) — filtered by year if specified
        List<Map<String, Object>> reportCard = gradingService.generateReportCard(user.getUserId(), targetYear);

        // Build comprehensive scorecard
        Map<String, Object> scorecard = new HashMap<>();
        scorecard.put("studentName", student.getFirstName() + " " + student.getLastName());
        scorecard.put("prn", student.getPrn());

        // Format academic year nicely (FIRST_YEAR -> "First Year")
        String formattedYear = "N/A";
        if (student.getAcademicYear() != null) {
            formattedYear = student.getAcademicYear().name().replace("_", " ");
            formattedYear = formattedYear.substring(0, 1).toUpperCase()
                    + formattedYear.substring(1).toLowerCase();
            // Capitalize each word
            String[] words = formattedYear.split(" ");
            StringBuilder sb = new StringBuilder();
            for (String w : words) {
                if (!sb.isEmpty()) sb.append(" ");
                sb.append(w.substring(0, 1).toUpperCase()).append(w.substring(1));
            }
            formattedYear = sb.toString();
        }
        scorecard.put("academicYear", formattedYear);
        scorecard.put("subjects", reportCard);

        // Calculate overall statistics
        double totalInternal = reportCard.stream()
                .mapToDouble(s -> ((Number) s.getOrDefault("internalMarks", 0)).doubleValue())
                .sum();
        double totalExternal = reportCard.stream()
                .mapToDouble(s -> ((Number) s.getOrDefault("externalMarks", 0)).doubleValue())
                .sum();
        double grandTotal = totalInternal + totalExternal;

        scorecard.put("totalInternal", totalInternal);
        scorecard.put("totalExternal", totalExternal);
        scorecard.put("grandTotal", grandTotal);
        scorecard.put("totalSubjects", reportCard.size());

        return ResponseEntity.ok(scorecard);
    }

    @GetMapping("/my-fee-status")
    public ResponseEntity<?> getMyFeeStatus(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        Map<String, Object> result = new HashMap<>();

        // Fee record
        FeeRecord feeRecord = feeRepository.findByStudentId(user.getUserId()).orElse(null);
        if (feeRecord != null) {
            result.put("hasFeeRecord", true);
            result.put("totalFee", feeRecord.getTotalFee());
            result.put("paidAmount", feeRecord.getPaidAmount());
            result.put("scholarshipAmount", feeRecord.getScholarshipAmount());
            double effectiveBalance = feeRecord.getTotalFee() - feeRecord.getPaidAmount() - feeRecord.getScholarshipAmount();
            result.put("balance", Math.max(effectiveBalance, 0));
            result.put("status", effectiveBalance <= 0 ? "PAID" : "PENDING");
        } else {
            result.put("hasFeeRecord", false);
        }

        // Scholarship status
        Student student = studentRepository.findById(user.getUserId()).orElse(null);
        result.put("scholarshipStatus", student != null && student.getScholarshipStatus() != null
                ? student.getScholarshipStatus().name() : "NOT_APPLIED");

        // Active reminders
        List<Map<String, Object>> reminders = feeReminderRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("title", r.getTitle());
                    map.put("message", r.getMessage());
                    map.put("dueDate", r.getDueDate());
                    map.put("createdAt", r.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());
        result.put("reminders", reminders);

        return ResponseEntity.ok(result);
    }
}