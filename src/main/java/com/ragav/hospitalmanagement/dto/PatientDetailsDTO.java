package com.ragav.hospitalmanagement.dto;

public class PatientDetailsDTO {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String patientCode;

    // Default Constructor
    public PatientDetailsDTO() {
    }

    // Full Constructor
    public PatientDetailsDTO(Long id, String name, String email, String role, String patientCode) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.patientCode = patientCode;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }
}
