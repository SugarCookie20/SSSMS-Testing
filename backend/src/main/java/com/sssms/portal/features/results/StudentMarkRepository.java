package com.sssms.portal.features.results;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentMarkRepository extends JpaRepository<StudentMark, Long> {
    List<StudentMark> findByStudentId(Long studentId);
    List<StudentMark> findByAssessmentId(Long assessmentId);
}

