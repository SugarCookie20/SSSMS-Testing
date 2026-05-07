package com.sssms.portal.features.timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectAllocationRepository extends JpaRepository<SubjectAllocation, Long> {

    List<SubjectAllocation> findByFacultyId(Long facultyId);
    List<SubjectAllocation> findBySubjectId(Long subjectId);
}