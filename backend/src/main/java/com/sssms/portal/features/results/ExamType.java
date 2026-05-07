package com.sssms.portal.features.results;

public enum ExamType {
    // Internal Assessment (ISE/ICA)
    UNIT_TEST_1,
    UNIT_TEST_2,
    UNIT_TEST_3,
    ASSIGNMENT,
    JURY,

    // External Assessment (ESE)
    THEORY_ESE,
    PRACTICAL_ESE,
    SESSIONAL_ESE;

    public boolean isInternal() {
        return this == UNIT_TEST_1 || this == UNIT_TEST_2 || this == UNIT_TEST_3
            || this == ASSIGNMENT || this == JURY;
    }

    public boolean isExternal() {
        return this == THEORY_ESE || this == PRACTICAL_ESE || this == SESSIONAL_ESE;
    }

    public boolean isUnitTest() {
        return this == UNIT_TEST_1 || this == UNIT_TEST_2 || this == UNIT_TEST_3;
    }
}