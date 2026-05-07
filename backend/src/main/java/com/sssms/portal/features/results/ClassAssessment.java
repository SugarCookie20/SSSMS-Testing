package com.sssms.portal.features.results;
import com.sssms.portal.features.student.Student;
import com.sssms.portal.features.timetable.SubjectAllocation;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "class_assessments")
public class ClassAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "allocation_id")
    private SubjectAllocation allocation;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    private String examType;
    private Double marksObtained;
    private Double maxMarks;
}