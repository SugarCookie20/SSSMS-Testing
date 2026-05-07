package com.sssms.portal.features.results;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByAllocationId(Long allocationId);
}
