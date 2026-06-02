package com.ragav.hospitalmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_slots")
public class DoctorSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @ManyToOne
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    @JsonIgnore
    private Doctor doctor;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "slot_time", nullable = false)
    private LocalTime slotTime;

    @Column(nullable = false)
    private Boolean available;

    // Default Constructor
    public DoctorSlot() {
    }

    // Constructor without id
    public DoctorSlot(Long doctorId, LocalDate slotDate, LocalTime slotTime, Boolean available) {
        this.doctorId = doctorId;
        this.slotDate = slotDate;
        this.slotTime = slotTime;
        this.available = available;
    }

    // Full Constructor
    public DoctorSlot(Long id, Long doctorId, LocalDate slotDate, LocalTime slotTime, Boolean available) {
        this.id = id;
        this.doctorId = doctorId;
        this.slotDate = slotDate;
        this.slotTime = slotTime;
        this.available = available;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getSlotDate() {
        return slotDate;
    }

    public void setSlotDate(LocalDate slotDate) {
        this.slotDate = slotDate;
    }

    public LocalTime getSlotTime() {
        return slotTime;
    }

    public void setSlotTime(LocalTime slotTime) {
        this.slotTime = slotTime;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getDoctorName() {
        return doctor != null ? doctor.getName() : "Unknown Doctor";
    }
}
