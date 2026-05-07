package com.sssms.portal.features.results.dto;

import com.sssms.portal.features.results.ExamType;
import lombok.Data;

@Data
public class AcademicMarksRequest {
    private Long studentId;
    private Long allocationId;
    private ExamType examType;
    private Double marks;
    private Double maxMarks;
}