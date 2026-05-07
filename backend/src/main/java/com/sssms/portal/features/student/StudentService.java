package com.sssms.portal.features.student;

import com.sssms.portal.features.attendance.dto.StudentAttendanceDTO;
import com.sssms.portal.features.student.dto.StudentProfileResponse;
import com.sssms.portal.shared.enums.*;
import com.sssms.portal.shared.entity.*;
import com.sssms.portal.features.attendance.*;
import com.sssms.portal.features.results.*;
import com.sssms.portal.features.timetable.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final SubjectRepository subjectRepository; // Make sure this is final
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final ExamResultRepository examResultRepository;

    public StudentProfileResponse getProfile(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 1. Calculate Overall Attendance
        List<StudentAttendanceDTO> attendanceList = getMyAttendance(userId);
        double avgAttendance = attendanceList.isEmpty() ? 0.0 :
            attendanceList.stream().mapToDouble(StudentAttendanceDTO::getPercentage).average().orElse(0.0);

        // 2. Fetch Real CGPA (use latest semester's cumulative CGPA)
        List<ExamResult> results = examResultRepository.findByStudentIdOrderBySemesterAsc(userId);
        double cgpa = 0.0;
        if (!results.isEmpty()) {
            // Get the CGPA from the latest semester (which is cumulative)
            ExamResult latestResult = results.get(results.size() - 1);
            cgpa = latestResult.getCgpa() != null ? latestResult.getCgpa() : 0.0;
        }

        return StudentProfileResponse.builder()
                .firstName(student.getFirstName())
                .middleName(student.getMiddleName())
                .lastName(student.getLastName())
                .email(student.getUser().getEmail())
                .prn(student.getPrn())
                .department("Architecture")
                .currentYear(student.getAcademicYear().toString())
                .phoneNumber(student.getPhoneNumber())
                .parentPhoneNumber(student.getParentPhoneNumber())
                .address(student.getAddress())
                .dob(student.getDob())
                .profilePhoto(student.getUser().getProfilePhoto())
                .fathersName(student.getFathersName())
                .mothersName(student.getMothersName())
                .gender(student.getGender())
                .religion(student.getReligion())
                .caste(student.getCaste())
                .coaEnrollmentNo(student.getCoaEnrollmentNo())
                .grNo(student.getGrNo())
                .aadharNo(student.getAadharNo())
                .abcId(student.getAbcId())
                .bloodGroup(student.getBloodGroup())
                .admissionCategory(student.getAdmissionCategory())
                .overallAttendance(Math.round(avgAttendance * 10.0) / 10.0)
                .cgpa(Math.round(cgpa * 100.0) / 100.0)
                .build();
    }

    public List<StudentAttendanceDTO> getMyAttendance(Long userId) {
        return getMyAttendance(userId, null);
    }

    public List<StudentAttendanceDTO> getMyAttendance(Long userId, AcademicYear forYear) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        AcademicYear targetYear = forYear != null ? forYear : student.getAcademicYear();

        // 1. Get ALL Subjects for the target year
        List<Subject> subjects = subjectRepository.findAll().stream()
                .filter(s -> s.getAcademicYear() == targetYear)
                .collect(Collectors.toList());

        Map<String, StudentAttendanceDTO> subjectMap = new HashMap<>();

        // 2. Pre-fill Map with Subjects
        for (Subject s : subjects) {
            subjectMap.put(s.getCode(), StudentAttendanceDTO.builder()
                    .subjectName(s.getName())
                    .subjectCode(s.getCode())
                    .totalSessions(0)
                    .attendedSessions(0)
                    .percentage(0.0)
                    .build());
        }

        // 3. Find Allocations
        List<SubjectAllocation> allocations = allocationRepository.findAll().stream()
                .filter(a -> a.getSubject().getAcademicYear() == targetYear)
                .collect(Collectors.toList());

        // Add Extra Courses
        if (student.getExtraCourses() != null) {
             allocations.addAll(student.getExtraCourses());
             for(SubjectAllocation sa : student.getExtraCourses()) {
                 if(!subjectMap.containsKey(sa.getSubject().getCode())) {
                     subjectMap.put(sa.getSubject().getCode(), StudentAttendanceDTO.builder()
                         .subjectName(sa.getSubject().getName())
                         .subjectCode(sa.getSubject().getCode())
                         .totalSessions(0).attendedSessions(0).percentage(0.0).build());
                 }
             }
        }

        // 4. Calculate Attendance from Allocations
        for (SubjectAllocation allocation : allocations) {
            String code = allocation.getSubject().getCode();

            long total = sessionRepository.findAll().stream()
                    .filter(s -> s.getAllocation().getId().equals(allocation.getId())).count();

            long attended = recordRepository.findAll().stream()
                    .filter(r -> r.getStudent().getId().equals(student.getId())
                            && r.getSession().getAllocation().getId().equals(allocation.getId())
                            && r.getStatus() == AttendanceStatus.PRESENT)
                    .count();

            if (subjectMap.containsKey(code)) {
                StudentAttendanceDTO dto = subjectMap.get(code);
                dto.setTotalSessions(dto.getTotalSessions() + (int) total);
                dto.setAttendedSessions(dto.getAttendedSessions() + (int) attended);
                // The allocation ID is set here to provide it to the frontend for detailed calendar viewing
                dto.setAllocationId(allocation.getId());
            }
        }

        // 5. Calculate Percentages
        return subjectMap.values().stream().map(dto -> {
            double p = (dto.getTotalSessions() == 0) ? 0 : ((double) dto.getAttendedSessions() / dto.getTotalSessions()) * 100;
            dto.setPercentage(Math.round(p * 10.0) / 10.0);
            return dto;
        }).collect(Collectors.toList());
    }
}