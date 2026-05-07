package com.sssms.portal.features.faculty.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FacultyProfileUpdateRequest {
    private String firstName;
    private String middleName;
    private String lastName;
    private String phoneNumber;
    private LocalDate dob;
    private String designation;
    private String department;
    private String qualification;
    private LocalDate joiningDate;
    private String coaRegistrationNo;
    private LocalDate coaValidFrom;
    private LocalDate coaValidTill;
    private String aadharNo;
    private String panCardNo;
}

