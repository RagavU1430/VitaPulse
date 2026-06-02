package com.ragav.hospitalmanagement.dto;

public class DashboardStatsResponse {

    private long totalDoctors;
    private long totalPatients;
    private long totalAppointments;
    private long availableSlots;

    // Default constructor
    public DashboardStatsResponse() {
    }

    // Parameterized constructor
    public DashboardStatsResponse(long totalDoctors, long totalPatients, long totalAppointments, long availableSlots) {
        this.totalDoctors = totalDoctors;
        this.totalPatients = totalPatients;
        this.totalAppointments = totalAppointments;
        this.availableSlots = availableSlots;
    }

    // Getters and setters
    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(long availableSlots) {
        this.availableSlots = availableSlots;
    }
}
