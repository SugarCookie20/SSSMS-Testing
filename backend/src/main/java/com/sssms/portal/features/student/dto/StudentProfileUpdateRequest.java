package com.sssms.portal.features.student.dto;

import lombok.Data;
import java.time.LocalDate;
import com.sssms.portal.shared.entity.AcademicYear;
import com.sssms.portal.features.student.AdmissionCategory;

@Data
public class StudentProfileUpdateRequest {
    private String firstName;
    private String middleName;
    private String lastName;
    private String phoneNumber;
    private String parentPhoneNumber;
    private String address;
    private LocalDate dob;
    private String coaEnrollmentNo;
    private String grNo;
    private String aadharNo;
    private String abcId;
    private String bloodGroup;
    private AcademicYear academicYear;
    private AdmissionCategory admissionCategory;
    
    private String fathersName;
    private String mothersName;
    private String gender;
    private String religion;
    private String caste;
}

