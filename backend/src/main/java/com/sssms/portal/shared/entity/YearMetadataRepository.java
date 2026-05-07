package com.sssms.portal.shared.entity;

import com.sssms.portal.shared.entity.AcademicYear;
import com.sssms.portal.shared.entity.YearMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YearMetadataRepository extends JpaRepository<YearMetadata, AcademicYear> {
}