package com.sssms.portal.features.attendance.dto;

import com.sssms.portal.shared.enums.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceRequest {
    private Long allocationId;
    private LocalDate date;
    private List<StudentStatus> students;

    @Data
    public static class StudentStatus {
        private Long studentId;
        private AttendanceStatus status;
    }
}