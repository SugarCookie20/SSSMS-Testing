package com.sssms.portal.features.results;
import com.sssms.portal.shared.entity.Subject;
import com.sssms.portal.features.student.Student;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "academic_marks")
public class AcademicMarks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Enumerated(EnumType.STRING)
    private ExamType examType;

    private Double marksObtained;
    private Double maxMarks;
}