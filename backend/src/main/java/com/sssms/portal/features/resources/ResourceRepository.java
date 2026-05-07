package com.sssms.portal.features.resources;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<AcademicResource, Long> {

    List<AcademicResource> findByAllocationId(Long allocationId);

    @Query("SELECT r FROM AcademicResource r WHERE r.allocation.subject.code = :subjectCode")
    List<AcademicResource> findBySubjectCode(@Param("subjectCode") String subjectCode);
}