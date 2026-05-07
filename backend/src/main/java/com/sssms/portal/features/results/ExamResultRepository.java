package com.sssms.portal.features.results;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    List<ExamResult> findByStudentIdOrderBySemesterAsc(Long studentId);
    List<ExamResult> findByStudentId(Long studentId);
    Optional<ExamResult> findByStudentIdAndSemester(Long studentId, Integer semester);
    List<ExamResult> findBySemester(Integer semester);
}