package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.entity.DoctorSlot;
import com.ragav.hospitalmanagement.repository.DoctorSlotRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-slots")
public class DoctorSlotApiController {

    private final DoctorSlotRepository doctorSlotRepository;

    public DoctorSlotApiController(DoctorSlotRepository doctorSlotRepository) {
        this.doctorSlotRepository = doctorSlotRepository;
    }

    // GET /api/doctor-slots
    @GetMapping
    public List<DoctorSlot> getAllAvailableSlots() {
        List<DoctorSlot> slots = doctorSlotRepository.findByAvailable(true);
        System.out.println("All Available Slots Found: " + slots.size());
        return slots;
    }

    // GET /api/doctor-slots/doctor/{doctorId}
    @GetMapping("/doctor/{doctorId}")
    public List<DoctorSlot> getAvailableSlotsByDoctorId(@PathVariable Long doctorId) {
        System.out.println("Doctor ID: " + doctorId);
        List<DoctorSlot> slots = doctorSlotRepository.findByDoctorIdAndAvailable(doctorId, true);
        System.out.println("Slots Found: " + slots.size());
        return slots;
    }
}
