package com.ragav.hospitalmanagement.dto;

public class BookAppointmentRequest {

    private Long doctorId;
    private Long slotId;
    private Long patientId;

    // Default Constructor
    public BookAppointmentRequest() {
    }

    // Parameterized Constructor
    public BookAppointmentRequest(Long doctorId, Long slotId, Long patientId) {
        this.doctorId = doctorId;
        this.slotId = slotId;
        this.patientId = patientId;
    }

    // Getters and Setters
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }
}
