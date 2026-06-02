package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.entity.Doctor;
import com.ragav.hospitalmanagement.entity.Appointment;
import com.ragav.hospitalmanagement.entity.User;
import com.ragav.hospitalmanagement.repository.DoctorRepository;
import com.ragav.hospitalmanagement.repository.DoctorSlotRepository;
import com.ragav.hospitalmanagement.repository.AppointmentRepository;
import com.ragav.hospitalmanagement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final DoctorSlotRepository doctorSlotRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    // Constructor injection
    public DoctorController(DoctorRepository doctorRepository,
                            DoctorSlotRepository doctorSlotRepository,
                            AppointmentRepository appointmentRepository,
                            UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.doctorSlotRepository = doctorSlotRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    // GET /doctors - Return all doctors
    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // GET /doctors/me - Get currently logged-in doctor's profile
    @GetMapping("/me")
    public ResponseEntity<Doctor> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = (String) auth.getPrincipal();
        return doctorRepository.findByEmail(email)
                .map(doctor -> ResponseEntity.ok(doctor))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // GET /doctors/me/statistics - Get statistics for currently logged-in doctor
    @GetMapping("/me/statistics")
    public ResponseEntity<?> getMyStatistics() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = (String) auth.getPrincipal();
        Optional<Doctor> doctorOpt = doctorRepository.findByEmail(email);
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return getDoctorStatistics(doctorOpt.get().getId());
    }

    // GET /doctors/me/patients - Get latest patients who booked appointments with currently logged-in doctor
    @GetMapping("/me/patients")
    public ResponseEntity<?> getMyPatients() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = (String) auth.getPrincipal();
        Optional<Doctor> doctorOpt = doctorRepository.findByEmail(email);
        if (doctorOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return getDoctorPatients(doctorOpt.get().getId());
    }

    // POST /doctors - Create a doctor
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        Doctor savedDoctor = doctorRepository.save(doctor);
        if (savedDoctor.getDoctorCode() == null || savedDoctor.getDoctorCode().isEmpty()) {
            savedDoctor.setDoctorCode(String.format("DR%06d", savedDoctor.getId()));
            savedDoctor = doctorRepository.save(savedDoctor);
        }
        return new ResponseEntity<>(savedDoctor, HttpStatus.CREATED);
    }

    // PUT /doctors/{id} - Update an existing doctor
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctorDetails) {
        return doctorRepository.findById(id)
                .map(doctor -> {
                    doctor.setName(doctorDetails.getName());
                    doctor.setSpecialization(doctorDetails.getSpecialization());
                    doctor.setExperience(doctorDetails.getExperience());
                    doctor.setEmail(doctorDetails.getEmail());
                    doctor.setPhone(doctorDetails.getPhone());
                    if (doctorDetails.getDoctorCode() != null && !doctorDetails.getDoctorCode().isEmpty()) {
                        doctor.setDoctorCode(doctorDetails.getDoctorCode());
                    }
                    Doctor updatedDoctor = doctorRepository.save(doctor);
                    return ResponseEntity.ok(updatedDoctor);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET /doctors/{id} - Return doctor by id
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return doctorRepository.findById(id)
                .map(doctor -> ResponseEntity.ok(doctor))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /doctors/{id} - Delete doctor by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctorById(@PathVariable Long id) {
        if (!doctorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        doctorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET /doctors/specialization/{specialization} - Find doctors by specialization
    @GetMapping("/specialization/{specialization}")
    public List<Doctor> getDoctorsBySpecialization(@PathVariable String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }

    // GET /doctors/{id}/statistics - Get statistics for a doctor
    @GetMapping("/{id}/statistics")
    public ResponseEntity<?> getDoctorStatistics(@PathVariable Long id) {
        if (!doctorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List<Appointment> appointments = appointmentRepository.findByDoctorId(id);
        long total = appointments.size();
        long completed = appointments.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();
        long cancelled = appointments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();
        long active = appointments.stream().filter(a -> "BOOKED".equals(a.getStatus())).count();

        long availableSlots = doctorSlotRepository.findByDoctorId(id).stream()
                .filter(slot -> slot.getAvailable() != null && slot.getAvailable())
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalAppointments", total);
        stats.put("completedAppointments", completed);
        stats.put("cancelledAppointments", cancelled);
        stats.put("activeAppointments", active);
        stats.put("availableSlots", availableSlots);

        return ResponseEntity.ok(stats);
    }

    // GET /doctors/{id}/patients - Get latest patients who booked appointments with a doctor
    @GetMapping("/{id}/patients")
    public ResponseEntity<?> getDoctorPatients(@PathVariable Long id) {
        if (!doctorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List<Appointment> appointments = appointmentRepository.findByDoctorId(id);
        List<Long> latestPatientIds = appointments.stream()
                .sorted((a1, a2) -> Long.compare(a2.getId(), a1.getId()))
                .map(Appointment::getPatientId)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        List<Map<String, String>> result = latestPatientIds.stream()
                .map(patientId -> {
                    Map<String, String> map = new HashMap<>();
                    Optional<User> userOpt = userRepository.findById(patientId);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        map.put("patientCode", user.getPatientCode());
                        map.put("patientName", user.getName());
                    } else {
                        map.put("patientCode", "PT" + String.format("%06d", patientId));
                        map.put("patientName", "Unknown Patient");
                    }
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
