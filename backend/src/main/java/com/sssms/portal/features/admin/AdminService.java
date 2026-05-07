package com.sssms.portal.features.admin;
import com.sssms.portal.features.attendance.AttendanceSession;
import com.sssms.portal.features.results.Assessment;
import com.sssms.portal.features.results.AcademicMarksRepository;
import com.sssms.portal.shared.utils.FileStorageService;

import com.sssms.portal.features.timetable.dto.AllocationRequest;
import com.sssms.portal.features.faculty.dto.FacultyEnrollmentRequest;
import com.sssms.portal.features.student.dto.StudentEnrollmentRequest;
import com.sssms.portal.shared.enums.*;
import com.sssms.portal.shared.entity.*;
import com.sssms.portal.features.auth.*;
import com.sssms.portal.features.attendance.*;
import com.sssms.portal.features.student.*;
import com.sssms.portal.features.results.*;
import com.sssms.portal.features.timetable.*;
import com.sssms.portal.features.resources.*;
import com.sssms.portal.features.fees.*;
import com.sssms.portal.features.faculty.*;
import com.sssms.portal.shared.utils.PasswordGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubjectRepository subjectRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final FeeRepository feeRepository;

    private final FileStorageService fileStorageService;
    private final ExamResultRepository resultRepository;
    private final ProfessionalDevelopmentRepository pdRepository;

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final StudentMarkRepository studentMarkRepository;
    private final AcademicMarksRepository academicMarksRepository;
    private final ClassAssessmentRepository classAssessmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final ResourceRepository resourceRepository;

    @Transactional
    public String enrollStudent(StudentEnrollmentRequest request, MultipartFile photoFile) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists. Please use a different email address.");
        }

        // Check if PRN already exists
        if (studentRepository.findByPrn(request.getPrn()).isPresent()) {
            throw new RuntimeException("PRN already exists. Please use a different PRN.");
        }

        // Auto-generate password from lastName + dob
        String generatedPassword = PasswordGeneratorUtil.generate(request.getLastName(), request.getDob());

        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(Role.STUDENT)
                .isActive(true)
                .build();
                
        if (photoFile != null && !photoFile.isEmpty()) {
            try {
                String photoUrl = fileStorageService.storeProfilePhoto(photoFile);
                newUser.setProfilePhoto(photoUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload profile photo.", e);
            }
        }
        
        User savedUser = userRepository.save(newUser);

        Student newStudent = Student.builder()
                .user(savedUser)
                .firstName(request.getFirstName())
                .middleName(request.getMiddleName())
                .lastName(request.getLastName())
                .fathersName(request.getFathersName())
                .mothersName(request.getMothersName())
                .gender(request.getGender())
                .religion(request.getReligion())
                .caste(request.getCaste())
                .prn(request.getPrn())
                .academicYear(request.getAcademicYear())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .dob(request.getDob())
                .coaEnrollmentNo(request.getCoaEnrollmentNo())
                .grNo(request.getGrNo())
                .aadharNo(request.getAadharNo())
                .abcId(request.getAbcId())
                .bloodGroup(request.getBloodGroup())
                .parentPhoneNumber(request.getParentPhoneNumber())
                .admissionCategory(request.getAdmissionCategory())
                .scholarshipStatus(ScholarshipStatus.NOT_APPLIED)
                .build();
        studentRepository.save(newStudent);

        feeRepository.save(FeeRecord.builder()
                .student(newStudent)
                .totalFee(150000.0)
                .paidAmount(0.0)
                .scholarshipAmount(0.0)
                .build());
        return "Student enrolled successfully. ID: " + newStudent.getId() + ". Default password: " + generatedPassword;
    }

    @Transactional
    public String enrollFaculty(FacultyEnrollmentRequest request) {
        // Auto-generate password from lastName + dob
        String generatedPassword = PasswordGeneratorUtil.generate(request.getLastName(), request.getDob());

        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(Role.FACULTY)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(newUser);

        Faculty newFaculty = Faculty.builder()
                .user(savedUser)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dob(request.getDob())
                .designation(request.getDesignation())
                .department(request.getDepartment())
                .qualification(request.getQualification())
                .phoneNumber(request.getPhoneNumber())
                .joiningDate(request.getJoiningDate())
                .coaRegistrationNo(request.getCoaRegistrationNo())
                .coaValidFrom(request.getCoaValidFrom())
                .coaValidTill(request.getCoaValidTill())
                .aadharNo(request.getAadharNo())
                .panCardNo(request.getPanCardNo())
                .build();
        facultyRepository.save(newFaculty);
        return "Faculty enrolled successfully. ID:" + newFaculty.getId() + ". Default password: " + generatedPassword;
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 1. Delete attendance records
        attendanceRecordRepository.deleteAll(attendanceRecordRepository.findByStudentId(studentId));

        // 2. Delete student marks (internal assessments)
        studentMarkRepository.deleteAll(studentMarkRepository.findByStudentId(studentId));

        // 3. Delete academic marks
        academicMarksRepository.deleteAll(academicMarksRepository.findByStudentId(studentId));

        // 4. Delete class assessments
        classAssessmentRepository.deleteAll(classAssessmentRepository.findByStudentId(studentId));

        // 5. Delete exam results
        resultRepository.deleteAll(resultRepository.findByStudentId(studentId));

        // 6. Clear extra courses (ManyToMany join table)
        student.getExtraCourses().clear();
        studentRepository.save(student);

        // 7. Delete fee record
        feeRepository.findByStudentId(studentId).ifPresent(feeRepository::delete);

        // 8. Delete student profile and user
        studentRepository.delete(student);
        userRepository.deleteById(studentId);
    }

    @Transactional
    public void deleteSubject(Long subjectId) {
        // 1. Delete AcademicMarks that reference this subject directly
        academicMarksRepository.deleteAll(academicMarksRepository.findBySubjectId(subjectId));

        // 2. For each allocation that references this subject, delete all downstream data
        List<SubjectAllocation> allocations = allocationRepository.findBySubjectId(subjectId);
        for (SubjectAllocation allocation : allocations) {
            Long allocationId = allocation.getId();

            // 2a. Remove this allocation from all students' extraCourses (clears student_extra_courses join table rows)
            List<Student> studentsWithCourse = studentRepository.findAll().stream()
                    .filter(s -> s.getExtraCourses().stream().anyMatch(ec -> ec.getId().equals(allocationId)))
                    .collect(java.util.stream.Collectors.toList());
            for (Student s : studentsWithCourse) {
                s.getExtraCourses().removeIf(ec -> ec.getId().equals(allocationId));
                studentRepository.save(s);
            }

            // 2b. Delete academic resources uploaded for this allocation
            resourceRepository.deleteAll(resourceRepository.findByAllocationId(allocationId));

            // 2c. Delete class assessments for this allocation
            classAssessmentRepository.deleteAll(classAssessmentRepository.findByAllocationId(allocationId));

            // 2d. Delete student marks for each assessment of this allocation
            List<Assessment> assessments = assessmentRepository.findByAllocationId(allocationId);
            for (Assessment assessment : assessments) {
                studentMarkRepository.deleteAll(studentMarkRepository.findByAssessmentId(assessment.getId()));
            }
            assessmentRepository.deleteAll(assessments);

            // 2e. Delete attendance records for each session of this allocation
            List<AttendanceSession> sessions = attendanceSessionRepository.findByAllocationId(allocationId);
            for (AttendanceSession session : sessions) {
                attendanceRecordRepository.deleteAll(attendanceRecordRepository.findBySessionId(session.getId()));
            }
            attendanceSessionRepository.deleteAll(sessions);
        }

        // 3. Delete allocations
        allocationRepository.deleteAll(allocations);

        // 4. Finally delete the subject
        subjectRepository.deleteById(subjectId);
    }

    public String allocateSubject(AllocationRequest request) {
        Faculty faculty = facultyRepository.findById(request.getFacultyId()).orElseThrow();
        Subject subject = subjectRepository.findById(request.getSubjectId()).orElseThrow();

        // Prevent Duplicate Allocation (same faculty, same subject)
        boolean existsForThisFaculty = allocationRepository.findAll().stream()
            .anyMatch(a -> a.getFaculty().getId().equals(faculty.getId()) && a.getSubject().getId().equals(subject.getId()));

        if (existsForThisFaculty) return "Subject already assigned to this faculty.";

        // Prevent subject from being assigned to multiple faculty at the same time
        Optional<SubjectAllocation> existingAllocation = allocationRepository.findAll().stream()
            .filter(a -> a.getSubject().getId().equals(subject.getId()))
            .findFirst();

        if (existingAllocation.isPresent()) {
            Faculty currentFaculty = existingAllocation.get().getFaculty();
            return "This subject is already assigned to " + currentFaculty.getFirstName() + " " + currentFaculty.getLastName()
                    + ". Remove it from their workload first before reassigning.";
        }

        SubjectAllocation allocation = SubjectAllocation.builder()
                .faculty(faculty)
                .subject(subject)
                .build();
        allocationRepository.save(allocation);
        return "Subject Assigned!";
    }

    public List<Map<String, Object>> getFacultyAllocations(Long facultyId) {
        List<SubjectAllocation> list = allocationRepository.findByFacultyId(facultyId);
        return list.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("subjectName", a.getSubject().getName());
            map.put("subjectCode", a.getSubject().getCode());
            if (a.getSubject().getAcademicYear() != null) {
                map.put("className", a.getSubject().getAcademicYear().toString());
            } else {
                map.put("className", "N/A");
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void removeAllocation(Long id) {
        // 1. Delete attendance records for each session of this allocation
        List<AttendanceSession> sessions = attendanceSessionRepository.findByAllocationId(id);
        for (AttendanceSession session : sessions) {
            attendanceRecordRepository.deleteAll(attendanceRecordRepository.findBySessionId(session.getId()));
        }
        attendanceSessionRepository.deleteAll(sessions);

        // 2. Delete class assessments for this allocation
        classAssessmentRepository.deleteAll(classAssessmentRepository.findByAllocationId(id));

        // 3. Delete student marks for each assessment of this allocation
        List<Assessment> assessments = assessmentRepository.findByAllocationId(id);
        for (Assessment assessment : assessments) {
            studentMarkRepository.deleteAll(studentMarkRepository.findByAssessmentId(assessment.getId()));
        }
        assessmentRepository.deleteAll(assessments);

        // 4. Delete academic resources uploaded for this allocation
        resourceRepository.deleteAll(resourceRepository.findByAllocationId(id));

        // 5. Remove this allocation from all students' extraCourses (clears student_extra_courses join table rows)
        List<Student> studentsWithCourse = studentRepository.findAll().stream()
                .filter(s -> s.getExtraCourses().stream().anyMatch(ec -> ec.getId().equals(id)))
                .collect(java.util.stream.Collectors.toList());
        for (Student s : studentsWithCourse) {
            s.getExtraCourses().removeIf(ec -> ec.getId().equals(id));
            studentRepository.save(s);
        }

        // 6. Delete the allocation itself
        allocationRepository.deleteById(id);
    }

    public List<Map<String, Object>> getAllFaculty() {
        return facultyRepository.findAll().stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("name", f.getFirstName() + " " + f.getLastName());
            map.put("email", f.getUser().getEmail());
            map.put("designation", f.getDesignation());
            if (f.getUser().getProfilePhoto() != null) {
                map.put("profilePhoto", f.getUser().getProfilePhoto());
            }
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getFacultyProfile(Long userId) {
            Faculty faculty = facultyRepository.findById(userId).orElseThrow();

            List<SubjectAllocation> allocations = allocationRepository.findByFacultyId(userId);
            List<String> subjects = allocations.stream()
                    .map(a -> a.getSubject().getName() + " (" + a.getSubject().getAcademicYear() + ")")
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("firstName", faculty.getFirstName());
            response.put("middleName", faculty.getMiddleName());
            response.put("lastName", faculty.getLastName());
            response.put("email", faculty.getUser().getEmail());
            response.put("dob", faculty.getDob());
            response.put("designation", faculty.getDesignation());
            response.put("department", faculty.getDepartment());
            response.put("qualification", faculty.getQualification());
            response.put("joiningDate", faculty.getJoiningDate());
            response.put("phoneNumber", faculty.getPhoneNumber());
            response.put("coaRegistrationNo", faculty.getCoaRegistrationNo());
            response.put("coaValidFrom", faculty.getCoaValidFrom());
            response.put("coaValidTill", faculty.getCoaValidTill());
            response.put("aadharNo", faculty.getAadharNo());
            response.put("panCardNo", faculty.getPanCardNo());
            if (faculty.getUser().getProfilePhoto() != null) {
                response.put("profilePhoto", faculty.getUser().getProfilePhoto());
            }
            response.put("subjects", subjects);

            // Professional Development summary
            List<ProfessionalDevelopment> pdEntries = pdRepository.findByFacultyIdOrderByStartDateDesc(userId);
            List<Map<String, Object>> pdSummary = pdEntries.stream().map(pd -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", pd.getId());
                m.put("title", pd.getTitle());
                m.put("type", pd.getType().name());
                m.put("organization", pd.getOrganization());
                m.put("startDate", pd.getStartDate());
                m.put("endDate", pd.getEndDate());
                return m;
            }).collect(Collectors.toList());
            response.put("professionalDevelopment", pdSummary);

            return response;
        }

    public String processResultLedger(MultipartFile file) { return "Results Processed"; }
    public List<Map<String, Object>> getAllAllocations() { return List.of(); }
}