package com.sssms.portal.features.timetable;
import com.sssms.portal.features.faculty.Faculty;
import com.sssms.portal.shared.entity.Subject;

 import jakarta.persistence.*;
 import lombok.*;

 @Data
 @Builder
 @NoArgsConstructor
 @AllArgsConstructor
 @Entity
 @Table(name = "subject_allocations")
 public class SubjectAllocation {
     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long id;

     @ManyToOne
     @JoinColumn(name = "faculty_id")
     private Faculty faculty;

     @ManyToOne
     @JoinColumn(name = "subject_id")
     private Subject subject;

 }