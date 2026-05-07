package com.sssms.portal.features.admin;
import com.sssms.portal.features.results.GradingService;
import com.sssms.portal.features.results.GPAService;


import com.sssms.portal.features.timetable.dto.AllocationRequest;
import com.sssms.portal.features.faculty.dto.FacultyEnrollmentRequest;
import com.sssms.portal.features.faculty.dto.FacultyProfileUpdateRequest;
import com.sssms.portal.features.student.dto.StudentEnrollmentRequest;
import com.sssms.portal.features.student.dto.StudentProfileUpdateRequest;
import com.sssms.portal.shared.entity.AcademicYear;
import com.sssms.portal.features.faculty.Faculty;
import com.sssms.portal.features.faculty.ProfessionalDevelopment;
import com.sssms.portal.features.student.Student;
import com.sssms.portal.shared.entity.Subject;
import com.sssms.portal.features.timetable.SubjectAllocation;
import com.sssms.portal.features.auth.User;
import com.sssms.portal.features.faculty.FacultyRepository;
import com.sssms.portal.features.faculty.ProfessionalDevelopmentRepository;
import com.sssms.portal.features.student.StudentRepository;
import com.sssms.portal.features.timetable.SubjectAllocationRepository;
import com.sssms.portal.shared.entity.SubjectRepository;
import com.sssms.portal.features.student.StudentService;
import com.sssms.portal.shared.utils.PasswordGeneratorUtil;
import com.sssms.portal.shared.utils.FileStorageService;
import com.sssms.portal.features.attendance.AttendanceRecord;
import com.sssms.portal.shared.enums.AttendanceStatus;
import com.sssms.portal.features.attendance.AttendanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.sssms.portal.features.auth.UserRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    private final AdminService adminService;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final ProfessionalDevelopmentRepository pdRepository;
    private final StudentService studentService;
    private final GradingService gradingService;
    private final GPAService gpaService;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final AttendanceRecordRepository recordRepository;

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody Subject subject) {
        subjectRepository.save(subject);
        return ResponseEntity.ok("Subject Created");
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping(value = "/enroll-student", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> enrollStudent(
            @RequestPart("data") StudentEnrollmentRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photoFile) {
        try {
            String result = adminService.enrollStudent(request, photoFile);
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", result);
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/enroll-faculty")
    public ResponseEntity<?> enrollFaculty(@RequestBody FacultyEnrollmentRequest request) {
        try {
            String result = adminService.enrollFaculty(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/upload-results")
    public ResponseEntity<String> uploadResults(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminService.processResultLedger(file));
    }

    @GetMapping("/faculty/{facultyId}/allocations")
    public ResponseEntity<?> getFacultyAllocations(@PathVariable Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyAllocations(facultyId));
    }

    @DeleteMapping("/allocation/{id}")
    public ResponseEntity<?> removeAllocation(@PathVariable Long id) {
        adminService.removeAllocation(id);
        return ResponseEntity.ok("Allocation removed successfully");
    }

    @GetMapping("/faculty/all")
    public ResponseEntity<List<Map<String, Object>>> getAllFaculty() {
        return ResponseEntity.ok(adminService.getAllFaculty());
    }

    @GetMapping("/years")
    public ResponseEntity<List<AcademicYear>> getAllYears() {
        return ResponseEntity.ok(Arrays.asList(AcademicYear.values()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String year) {
        List<Student> allStudents = studentRepository.findAll();
        if (year != null && !year.isEmpty()) {
            try {
                AcademicYear yearEnum = AcademicYear.valueOf(year);
                allStudents = allStudents.stream()
                        .filter(s -> s.getAcademicYear() == yearEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) { }
        }
        allStudents.sort(Comparator.comparing(Student::getFirstName));
        return ResponseEntity.ok(allStudents);
    }

    @PutMapping("/student/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody StudentEnrollmentRequest request) {
        Student student = studentRepository.findById(id).orElseThrow();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        if (request.getAcademicYear() != null) {
            student.setAcademicYear(request.getAcademicYear());
        }
        studentRepository.save(student);
        return ResponseEntity.ok("Student Updated");
    }

    @PostMapping("/allocate-subject")
    public ResponseEntity<String> allocateSubject(@RequestBody AllocationRequest request) {
        return ResponseEntity.ok(adminService.allocateSubject(request));
    }

    @GetMapping("/allocations/all")
    public ResponseEntity<List<Map<String, Object>>> getAllAllocations() {
        List<SubjectAllocation> list = allocationRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(a -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", a.getId());
            map.put("subjectName", a.getSubject().getName());
            map.put("subjectCode", a.getSubject().getCode());
            if (a.getFaculty() != null) {
                map.put("facultyName", a.getFaculty().getFirstName() + " " + a.getFaculty().getLastName());
            } else {
                map.put("facultyName", "Unassigned");
            }
            map.put("year", a.getSubject().getAcademicYear() != null ? a.getSubject().getAcademicYear().toString() : "N/A");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/student/{studentId}/course/{allocationId}")
    public ResponseEntity<?> addCourseToStudent(@PathVariable Long studentId, @PathVariable Long allocationId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        SubjectAllocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        student.getExtraCourses().add(allocation);
        studentRepository.save(student);
        return ResponseEntity.ok("Course Assigned");
    }

    @DeleteMapping("/student/{studentId}/course/{allocationId}")
    public ResponseEntity<?> removeCourseFromStudent(@PathVariable Long studentId, @PathVariable Long allocationId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        SubjectAllocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        student.getExtraCourses().remove(allocation);
        studentRepository.save(student);
        return ResponseEntity.ok("Course Removed");
    }

    @DeleteMapping("/student/{id}")
        public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
            adminService.deleteStudent(id);
            return ResponseEntity.ok("Student Un-enrolled Successfully");
        }

    @DeleteMapping("/faculty/{id}")
        public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("Faculty Un-enrolled Successfully");
        }

    @DeleteMapping("/subject/{id}")
        public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
            try {
                adminService.deleteSubject(id);
                return ResponseEntity.ok("Subject Deleted Successfully");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Failed to delete subject: " + e.getMessage());
            }
        }

    @GetMapping("/student/{id}/profile")
        public ResponseEntity<?> getStudentProfile(@PathVariable Long id) {
            return ResponseEntity.ok(studentService.getProfile(id));
        }

    @PutMapping("/student/{id}/profile")
        public ResponseEntity<?> updateStudentProfile(@PathVariable Long id, @RequestBody StudentProfileUpdateRequest request) {
            Student student = studentRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Student not found"));

            if (request.getFirstName() != null) student.setFirstName(request.getFirstName());
            if (request.getMiddleName() != null) student.setMiddleName(request.getMiddleName());
            if (request.getLastName() != null) student.setLastName(request.getLastName());
            if (request.getPhoneNumber() != null) student.setPhoneNumber(request.getPhoneNumber());
            if (request.getParentPhoneNumber() != null) student.setParentPhoneNumber(request.getParentPhoneNumber());
            if (request.getAddress() != null) student.setAddress(request.getAddress());
            if (request.getDob() != null) student.setDob(request.getDob());
            if (request.getCoaEnrollmentNo() != null) student.setCoaEnrollmentNo(request.getCoaEnrollmentNo());
            if (request.getGrNo() != null) student.setGrNo(request.getGrNo());
            if (request.getAadharNo() != null) student.setAadharNo(request.getAadharNo());
            if (request.getAbcId() != null) student.setAbcId(request.getAbcId());
            if (request.getBloodGroup() != null) student.setBloodGroup(request.getBloodGroup());
            if (request.getAcademicYear() != null) student.setAcademicYear(request.getAcademicYear());
            if (request.getAdmissionCategory() != null) student.setAdmissionCategory(request.getAdmissionCategory());
            
            if (request.getFathersName() != null) student.setFathersName(request.getFathersName());
            if (request.getMothersName() != null) student.setMothersName(request.getMothersName());
            if (request.getGender() != null) student.setGender(request.getGender());
            if (request.getReligion() != null) student.setReligion(request.getReligion());
            if (request.getCaste() != null) student.setCaste(request.getCaste());

            studentRepository.save(student);
            return ResponseEntity.ok("Student profile updated successfully");
        }

    @PostMapping("/student/{id}/photo")
    public ResponseEntity<?> uploadStudentPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Student student = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
        User user = student.getUser();
        // Delete old photo from disk before replacing
        if (user.getProfilePhoto() != null) {
            fileStorageService.deleteProfilePhoto(user.getProfilePhoto());
        }
        String fileName = fileStorageService.storeProfilePhoto(file);
        user.setProfilePhoto(fileName);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile photo updated", "fileName", fileName));
    }

    @PostMapping("/faculty/{id}/photo")
    public ResponseEntity<?> uploadFacultyPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Faculty faculty = facultyRepository.findById(id).orElseThrow(() -> new RuntimeException("Faculty not found"));
        User user = faculty.getUser();
        // Delete old photo from disk before replacing
        if (user.getProfilePhoto() != null) {
            fileStorageService.deleteProfilePhoto(user.getProfilePhoto());
        }
        String fileName = fileStorageService.storeProfilePhoto(file);
        user.setProfilePhoto(fileName);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile photo updated", "fileName", fileName));
    }

    @GetMapping("/student/{id}/attendance-dates/{allocationId}")
    public ResponseEntity<?> getStudentAttendanceDates(@PathVariable Long id, @PathVariable Long allocationId) {
        List<LocalDate> presentDates = recordRepository.findAll().stream()
                .filter(r -> r.getStudent().getId().equals(id)
                        && r.getSession().getAllocation().getId().equals(allocationId)
                        && r.getStatus() == AttendanceStatus.PRESENT)
                .map(r -> r.getSession().getDate())
                .collect(Collectors.toList());
        return ResponseEntity.ok(presentDates);
    }

    @GetMapping("/student/{id}/attendance")
    public ResponseEntity<?> getStudentAttendanceList(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getMyAttendance(id));
    }

    @GetMapping("/faculty/{id}/profile")
        public ResponseEntity<?> getFacultyProfile(@PathVariable Long id) {
            return ResponseEntity.ok(adminService.getFacultyProfile(id));
     }

    @PutMapping("/faculty/{id}/profile")
        public ResponseEntity<?> updateFacultyProfile(@PathVariable Long id, @RequestBody FacultyProfileUpdateRequest request) {
            Faculty faculty = facultyRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Faculty not found"));

            if (request.getFirstName() != null) faculty.setFirstName(request.getFirstName());
            if (request.getMiddleName() != null) faculty.setMiddleName(request.getMiddleName());
            if (request.getLastName() != null) faculty.setLastName(request.getLastName());
            if (request.getPhoneNumber() != null) faculty.setPhoneNumber(request.getPhoneNumber());
            if (request.getDob() != null) faculty.setDob(request.getDob());
            if (request.getDesignation() != null) faculty.setDesignation(request.getDesignation());
            if (request.getDepartment() != null) faculty.setDepartment(request.getDepartment());
            if (request.getQualification() != null) faculty.setQualification(request.getQualification());
            if (request.getJoiningDate() != null) faculty.setJoiningDate(request.getJoiningDate());
            if (request.getCoaRegistrationNo() != null) faculty.setCoaRegistrationNo(request.getCoaRegistrationNo());
            if (request.getCoaValidFrom() != null) faculty.setCoaValidFrom(request.getCoaValidFrom());
            if (request.getCoaValidTill() != null) faculty.setCoaValidTill(request.getCoaValidTill());
            if (request.getAadharNo() != null) faculty.setAadharNo(request.getAadharNo());
            if (request.getPanCardNo() != null) faculty.setPanCardNo(request.getPanCardNo());

            facultyRepository.save(faculty);
            return ResponseEntity.ok("Faculty profile updated successfully");
        }

    // ==================== PASSWORD RESET ====================

    @PostMapping("/student/{id}/reset-password")
        public ResponseEntity<?> resetStudentPassword(@PathVariable Long id) {
            Student student = studentRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Student not found"));
            User user = userRepository.findById(id).orElseThrow(() ->
                new RuntimeException("User not found"));

            if (student.getLastName() == null || student.getDob() == null) {
                return ResponseEntity.badRequest().body("Cannot reset password: Last name or DOB is missing");
            }

            String defaultPassword = PasswordGeneratorUtil.generate(student.getLastName(), student.getDob());
            user.setPasswordHash(passwordEncoder.encode(defaultPassword));
            userRepository.save(user);

            return ResponseEntity.ok("Password reset to default successfully");
        }

    @PostMapping("/faculty/{id}/reset-password")
        public ResponseEntity<?> resetFacultyPassword(@PathVariable Long id) {
            Faculty faculty = facultyRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Faculty not found"));
            User user = userRepository.findById(id).orElseThrow(() ->
                new RuntimeException("User not found"));

            if (faculty.getLastName() == null || faculty.getDob() == null) {
                return ResponseEntity.badRequest().body("Cannot reset password: Last name or DOB is missing");
            }

            String defaultPassword = PasswordGeneratorUtil.generate(faculty.getLastName(), faculty.getDob());
            user.setPasswordHash(passwordEncoder.encode(defaultPassword));
            userRepository.save(user);

            return ResponseEntity.ok("Password reset to default successfully");
        }

    @GetMapping("/report-card/{studentId}")
    public ResponseEntity<?> getStudentReportCard(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradingService.generateReportCard(studentId));
    }

    // ==================== PROFESSIONAL DEVELOPMENT ====================

    @GetMapping("/faculty/{facultyId}/pd")
    public ResponseEntity<?> getFacultyPD(@PathVariable Long facultyId) {
        List<ProfessionalDevelopment> entries = pdRepository.findByFacultyIdOrderByStartDateDesc(facultyId);
        return ResponseEntity.ok(entries.stream().map(this::mapPD).collect(Collectors.toList()));
    }

    @PostMapping("/faculty/{facultyId}/pd")
    public ResponseEntity<?> addFacultyPD(
            @PathVariable Long facultyId,
            @RequestBody Map<String, String> payload) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        ProfessionalDevelopment pd = ProfessionalDevelopment.builder()
                .faculty(faculty)
                .title(payload.get("title"))
                .type(ProfessionalDevelopment.PDType.valueOf(payload.get("type")))
                .organization(payload.get("organization"))
                .startDate(payload.get("startDate") != null && !payload.get("startDate").isEmpty() ? LocalDate.parse(payload.get("startDate")) : null)
                .endDate(payload.get("endDate") != null && !payload.get("endDate").isEmpty() ? LocalDate.parse(payload.get("endDate")) : null)
                .description(payload.get("description"))
                .addedBy("admin")
                .build();
        pdRepository.save(pd);
        return ResponseEntity.ok("Entry added for faculty");
    }

    @DeleteMapping("/pd/{id}")
    public ResponseEntity<?> deletePD(@PathVariable Long id) {
        pdRepository.deleteById(id);
        return ResponseEntity.ok("Entry deleted");
    }

    private Map<String, Object> mapPD(ProfessionalDevelopment pd) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", pd.getId());
        map.put("title", pd.getTitle());
        map.put("type", pd.getType().name());
        map.put("organization", pd.getOrganization());
        map.put("startDate", pd.getStartDate());
        map.put("endDate", pd.getEndDate());
        map.put("description", pd.getDescription());
        map.put("addedBy", pd.getAddedBy());
        map.put("createdAt", pd.getCreatedAt());
        map.put("facultyName", pd.getFaculty().getFirstName() + " " + pd.getFaculty().getLastName());
        return map;
    }

    // ==================== GPA LEDGER ====================

    @GetMapping("/gpa/students")
    public ResponseEntity<?> getStudentsForGPA(
            @RequestParam(required = false) String year,
            @RequestParam(required = false) Integer semester) {
        List<Student> students = studentRepository.findAll();

        // Filter by year if provided
        if (year != null && !year.isEmpty()) {
            try {
                AcademicYear yearEnum = AcademicYear.valueOf(year);
                students = students.stream()
                        .filter(s -> s.getAcademicYear() == yearEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) { }
        }

        students.sort(Comparator.comparing(Student::getFirstName));

        // Get SGPA for each student for the selected semester
        List<Map<String, Object>> response = students.stream().map(student -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", student.getId());
            map.put("prn", student.getPrn());
            map.put("firstName", student.getFirstName());
            map.put("lastName", student.getLastName());
            map.put("academicYear", student.getAcademicYear() != null ? student.getAcademicYear().toString() : "N/A");

            // Get existing result for this semester
            if (semester != null) {
                gpaService.getStudentResults(student.getId()).stream()
                        .filter(r -> r.getSemester().equals(semester))
                        .findFirst()
                        .ifPresent(result -> {
                            map.put("sgpa", result.getSgpa());
                            map.put("cgpa", result.getCgpa());
                            map.put("status", result.getStatus());
                        });
            }

            // Get overall CGPA
            Double overallCgpa = gpaService.calculateOverallCGPA(student.getId());
            map.put("overallCgpa", overallCgpa);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/gpa/enter")
    public ResponseEntity<?> enterSGPA(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        Integer semester = Integer.valueOf(payload.get("semester").toString());
        Double sgpa = Double.valueOf(payload.get("sgpa").toString());
        String status = payload.get("status").toString();

        gpaService.enterSGPA(studentId, semester, sgpa, status);

        return ResponseEntity.ok("SGPA entered successfully");
    }

    @PostMapping("/gpa/batch")
    public ResponseEntity<?> enterBatchSGPA(@RequestBody List<Map<String, Object>> batch) {
        for (Map<String, Object> entry : batch) {
            Long studentId = Long.valueOf(entry.get("studentId").toString());
            Integer semester = Integer.valueOf(entry.get("semester").toString());
            Double sgpa = Double.valueOf(entry.get("sgpa").toString());
            String status = entry.get("status").toString();

            gpaService.enterSGPA(studentId, semester, sgpa, status);
        }

        return ResponseEntity.ok("Batch SGPA entered successfully");
    }
}

