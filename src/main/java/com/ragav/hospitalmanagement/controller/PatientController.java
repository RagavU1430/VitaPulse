package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.dto.PatientDetailsDTO;
import com.ragav.hospitalmanagement.dto.PatientProjection;
import com.ragav.hospitalmanagement.entity.Appointment;
import com.ragav.hospitalmanagement.entity.Patient;
import com.ragav.hospitalmanagement.service.AppointmentService;
import com.ragav.hospitalmanagement.entity.User;
import com.ragav.hospitalmanagement.repository.AppointmentRepository;
import com.ragav.hospitalmanagement.repository.PatientRepository;
import com.ragav.hospitalmanagement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;

    // Constructor injection
    public PatientController(PatientRepository patientRepository, 
                             UserRepository userRepository, 
                             AppointmentRepository appointmentRepository,
                             AppointmentService appointmentService) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.appointmentService = appointmentService;
    }

    // GET /patients - Return all patients
    @GetMapping
    public List<PatientProjection> getAllPatients() {
        return userRepository.findByRole("PATIENT");
    }

    // POST /patients - Create a patient
    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Patient savedPatient = patientRepository.save(patient);
        return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
    }

    // GET /patients/{id} - Return patient by id (legacy Patient entity)
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        System.out.println("Loading patient: " + id);
        return patientRepository.findById(id)
                .map(patient -> ResponseEntity.ok(patient))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET /patients/{id}/details - Return patient user profile (User-based)
    @GetMapping("/{id}/details")
    public ResponseEntity<PatientDetailsDTO> getPatientDetails(@PathVariable Long id) {
        System.out.println("Loading patient details: " + id);
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || !"PATIENT".equals(userOpt.get().getRole())) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        PatientDetailsDTO dto = new PatientDetailsDTO(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPatientCode());
        return ResponseEntity.ok(dto);
    }

    // GET /patients/{id}/appointments - Return appointment history for a patient user
    @GetMapping("/{id}/appointments")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || !"PATIENT".equals(userOpt.get().getRole())) {
            return ResponseEntity.notFound().build();
        }
        List<Appointment> appointments = appointmentRepository.findByPatientId(id);
        appointmentService.populateDoctorNames(appointments);
        return ResponseEntity.ok(appointments);
    }

    // GET /patients/{id}/stats - Return appointment statistics for a patient user
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Long>> getPatientStats(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || !"PATIENT".equals(userOpt.get().getRole())) {
            return ResponseEntity.notFound().build();
        }
        List<Appointment> appointments = appointmentRepository.findByPatientId(id);
        long total = appointments.size();
        long booked = appointments.stream().filter(a -> "BOOKED".equals(a.getStatus())).count();
        long cancelled = appointments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();
        long completed = appointments.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalAppointments", total);
        stats.put("activeAppointments", booked);
        stats.put("cancelledAppointments", cancelled);
        stats.put("completedAppointments", completed);

        return ResponseEntity.ok(stats);
    }

    // DELETE /patients/{id} - Delete patient by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatientById(@PathVariable Long id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET /patients/search/{name} - Search patients by name (case-insensitive)
    @GetMapping("/search/{name}")
    public List<Patient> searchPatientsByName(@PathVariable String name) {
        return patientRepository.findByNameContainingIgnoreCase(name);
    }

    // GET /patients/search?keyword=value - Search patients by name or email (case-insensitive)
    @GetMapping("/search")
    public List<PatientProjection> searchPatients(@RequestParam("keyword") String keyword) {
        return userRepository.searchPatients(keyword);
    }
}
