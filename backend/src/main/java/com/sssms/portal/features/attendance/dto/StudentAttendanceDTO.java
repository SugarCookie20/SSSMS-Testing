package com.sssms.portal.features.attendance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentAttendanceDTO {
    private String subjectName;
    private String subjectCode;
    private int totalSessions;
    private int attendedSessions;
    private double percentage;
    private Long allocationId;
}