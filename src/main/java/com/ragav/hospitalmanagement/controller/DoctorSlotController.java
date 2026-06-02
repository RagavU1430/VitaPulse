package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.entity.DoctorSlot;
import com.ragav.hospitalmanagement.repository.DoctorSlotRepository;
import com.ragav.hospitalmanagement.repository.DoctorRepository;
import com.ragav.hospitalmanagement.repository.AppointmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/slots")
public class DoctorSlotController {

    private final DoctorSlotRepository doctorSlotRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    // Constructor injection
    public DoctorSlotController(DoctorSlotRepository doctorSlotRepository,
                                DoctorRepository doctorRepository,
                                AppointmentRepository appointmentRepository) {
        this.doctorSlotRepository = doctorSlotRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // GET /slots - Return all slots
    @GetMapping
    public List<DoctorSlot> getAllSlots() {
        return doctorSlotRepository.findAll();
    }

    // POST /slots - Create a slot
    @PostMapping
    public ResponseEntity<?> createSlot(@RequestBody DoctorSlot doctorSlot) {
        if (doctorSlot.getDoctorId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor ID is required."));
        }
        if (doctorSlot.getSlotDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slot date is required."));
        }
        if (doctorSlot.getSlotTime() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slot time is required."));
        }

        // Validate doctor exists
        if (!doctorRepository.existsById(doctorSlot.getDoctorId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor not found with ID: " + doctorSlot.getDoctorId()));
        }

        // Validate not in the past
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (doctorSlot.getSlotDate().isBefore(today) || 
            (doctorSlot.getSlotDate().equals(today) && doctorSlot.getSlotTime().isBefore(now))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slot date and time cannot be in the past."));
        }

        // Validate duplicate
        if (doctorSlotRepository.findByDoctorIdAndSlotDateAndSlotTime(
                doctorSlot.getDoctorId(), doctorSlot.getSlotDate(), doctorSlot.getSlotTime()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "A slot already exists for this doctor at the specified date and time."));
        }

        doctorSlot.setAvailable(true);
        DoctorSlot savedSlot = doctorSlotRepository.save(doctorSlot);
        return new ResponseEntity<>(savedSlot, HttpStatus.CREATED);
    }

    // GET /slots/doctor/{doctorId} - Return slots for doctor id
    @GetMapping("/doctor/{doctorId}")
    public List<DoctorSlot> getSlotsByDoctorId(@PathVariable Long doctorId) {
        return doctorSlotRepository.findByDoctorId(doctorId);
    }

    // PUT /slots/{id} - Update an existing slot
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id, @RequestBody DoctorSlot slotDetails) {
        return doctorSlotRepository.findById(id)
                .map(slot -> {
                    // Cannot edit slots already booked
                    if (!slot.getAvailable()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Cannot edit slots that are already booked."));
                    }

                    if (slotDetails.getSlotDate() == null) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Slot date is required."));
                    }
                    if (slotDetails.getSlotTime() == null) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Slot time is required."));
                    }

                    // Validate not in the past
                    LocalDate today = LocalDate.now();
                    LocalTime now = LocalTime.now();
                    if (slotDetails.getSlotDate().isBefore(today) || 
                        (slotDetails.getSlotDate().equals(today) && slotDetails.getSlotTime().isBefore(now))) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Slot date and time cannot be in the past."));
                    }

                    // Check duplicate for other slots
                    Optional<DoctorSlot> duplicate = doctorSlotRepository.findByDoctorIdAndSlotDateAndSlotTime(
                            slot.getDoctorId(), slotDetails.getSlotDate(), slotDetails.getSlotTime());
                    if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
                        return ResponseEntity.badRequest().body(Map.of("message", "A slot already exists for this doctor at the specified date and time."));
                    }

                    slot.setSlotDate(slotDetails.getSlotDate());
                    slot.setSlotTime(slotDetails.getSlotTime());
                    DoctorSlot updatedSlot = doctorSlotRepository.save(slot);
                    return ResponseEntity.ok(updatedSlot);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /slots/{id} - Delete slot by id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlotById(@PathVariable Long id) {
        return doctorSlotRepository.findById(id)
                .map(slot -> {
                    // Cannot delete slot if appointment exists / already booked
                    if (!slot.getAvailable()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete slot because an active appointment is booked for it."));
                    }
                    doctorSlotRepository.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
