package com.sssms.portal.features.attendance.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AttendanceReportDTO {
    private int totalSessionsHeld;
    private String subjectName;
    private String className;
    private String range;
    private List<StudentStat> studentStats;

    @Data
    @Builder
    public static class StudentStat {
        private String studentName;
        private String prn;
        private int sessionsAttended;
        private double percentage;
    }
}