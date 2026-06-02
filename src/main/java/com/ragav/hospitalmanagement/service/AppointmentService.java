package com.ragav.hospitalmanagement.service;

import com.ragav.hospitalmanagement.entity.Appointment;
import com.ragav.hospitalmanagement.entity.DoctorSlot;
import com.ragav.hospitalmanagement.entity.User;
import com.ragav.hospitalmanagement.entity.Doctor;
import com.ragav.hospitalmanagement.repository.AppointmentRepository;
import com.ragav.hospitalmanagement.repository.DoctorSlotRepository;
import com.ragav.hospitalmanagement.repository.UserRepository;
import com.ragav.hospitalmanagement.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class AppointmentService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final DoctorSlotRepository doctorSlotRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final EmailService emailService;

    // Constructor injection
    public AppointmentService(AppointmentRepository appointmentRepository, 
                              DoctorSlotRepository doctorSlotRepository,
                              UserRepository userRepository,
                              DoctorRepository doctorRepository,
                              EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorSlotRepository = doctorSlotRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Appointment bookAppointment(Long doctorId, Long slotId, Long patientId) {
        // 1. Find slot by id
        DoctorSlot slot = doctorSlotRepository.findById(slotId)
                // 2. If slot not found throw RuntimeException
                .orElseThrow(() -> new RuntimeException("Slot not found with id: " + slotId));

        // 3. If slot.available is false throw RuntimeException("Slot already booked")
        if (!slot.getAvailable()) {
            throw new RuntimeException("Slot already booked");
        }

        // Optional check: ensure slot belongs to the requested doctor
        if (!slot.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Slot does not belong to doctor with id: " + doctorId);
        }

        // 4. Create Appointment
        Appointment appointment = new Appointment();
        
        // 5. Set doctorId
        appointment.setDoctorId(doctorId);
        
        // 6. Set patientId
        appointment.setPatientId(patientId);
        
        // 7. Set appointmentDate from slotDate
        appointment.setAppointmentDate(slot.getSlotDate());
        
        // 8. Set appointmentTime from slotTime
        appointment.setAppointmentTime(slot.getSlotTime());
        
        // 9. Set status = "BOOKED"
        appointment.setStatus("BOOKED");

        // 10. Save appointment
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 11. Set slot.available = false
        slot.setAvailable(false);

        // 12. Save slot
        doctorSlotRepository.save(slot);

        // Trigger automatic email notification
        try {
            Optional<User> patientOpt = userRepository.findById(savedAppointment.getPatientId());
            Optional<Doctor> doctorOpt = doctorRepository.findById(savedAppointment.getDoctorId());
            if (patientOpt.isPresent() && doctorOpt.isPresent()) {
                User patient = patientOpt.get();
                Doctor doctor = doctorOpt.get();
                emailService.sendAppointmentBookedEmail(
                        patient.getName(),
                        patient.getEmail(),
                        doctor.getName(),
                        savedAppointment.getAppointmentDate().toString(),
                        savedAppointment.getAppointmentTime().toString()
                );
            } else {
                logger.warn("Could not send booked email: Patient or Doctor profile not found. patientId={}, doctorId={}", 
                        savedAppointment.getPatientId(), savedAppointment.getDoctorId());
            }
        } catch (Exception e) {
            logger.error("Error triggering appointment booked email for ID: " + savedAppointment.getId(), e);
        }

        // 13. Return appointment
        populateDoctorName(savedAppointment);
        return savedAppointment;
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId) {
        // 1. Find appointment by id
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 2. Validate appointment is currently BOOKED
        if (!"BOOKED".equals(appointment.getStatus())) {
            throw new RuntimeException("Only BOOKED appointments can be cancelled. Current status: " + appointment.getStatus());
        }

        // 3. Find DoctorSlot using appointment date and time and free it
        doctorSlotRepository.findByDoctorIdAndSlotDateAndSlotTime(
                appointment.getDoctorId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime()
        ).ifPresent(slot -> {
            slot.setAvailable(true);
            doctorSlotRepository.save(slot);
        });

        // 4. Update status to CANCELLED (instead of deleting)
        appointment.setStatus("CANCELLED");
        Appointment savedAppt = appointmentRepository.save(appointment);

        // Trigger automatic email notification
        try {
            Optional<User> patientOpt = userRepository.findById(savedAppt.getPatientId());
            Optional<Doctor> doctorOpt = doctorRepository.findById(savedAppt.getDoctorId());
            if (patientOpt.isPresent() && doctorOpt.isPresent()) {
                User patient = patientOpt.get();
                Doctor doctor = doctorOpt.get();
                emailService.sendAppointmentCancelledEmail(
                        patient.getName(),
                        patient.getEmail(),
                        doctor.getName(),
                        savedAppt.getAppointmentDate().toString(),
                        savedAppt.getAppointmentTime().toString()
                );
            } else {
                logger.warn("Could not send cancelled email: Patient or Doctor profile not found. patientId={}, doctorId={}", 
                        savedAppt.getPatientId(), savedAppt.getDoctorId());
            }
        } catch (Exception e) {
            logger.error("Error triggering appointment cancelled email for ID: " + savedAppt.getId(), e);
        }

        populateDoctorName(savedAppt);
        return savedAppt;
    }

    @Transactional
    public Appointment completeAppointment(Long appointmentId) {
        // 1. Find appointment by id
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 2. Validate appointment is currently BOOKED
        if (!"BOOKED".equals(appointment.getStatus())) {
            throw new RuntimeException("Only BOOKED appointments can be completed. Current status: " + appointment.getStatus());
        }

        // 3. Find DoctorSlot using appointment date and time and free it
        doctorSlotRepository.findByDoctorIdAndSlotDateAndSlotTime(
                appointment.getDoctorId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime()
        ).ifPresent(slot -> {
            slot.setAvailable(true);
            doctorSlotRepository.save(slot);
        });

        // 4. Update status to COMPLETED
        appointment.setStatus("COMPLETED");
        Appointment savedAppt = appointmentRepository.save(appointment);

        // Trigger automatic email notification
        try {
            Optional<User> patientOpt = userRepository.findById(savedAppt.getPatientId());
            Optional<Doctor> doctorOpt = doctorRepository.findById(savedAppt.getDoctorId());
            if (patientOpt.isPresent() && doctorOpt.isPresent()) {
                User patient = patientOpt.get();
                Doctor doctor = doctorOpt.get();
                emailService.sendAppointmentCompletedEmail(
                        patient.getName(),
                        patient.getEmail(),
                        doctor.getName(),
                        savedAppt.getAppointmentDate().toString(),
                        savedAppt.getAppointmentTime().toString()
                );
            } else {
                logger.warn("Could not send completed email: Patient or Doctor profile not found. patientId={}, doctorId={}", 
                        savedAppt.getPatientId(), savedAppt.getDoctorId());
            }
        } catch (Exception e) {
            logger.error("Error triggering appointment completed email for ID: " + savedAppt.getId(), e);
        }

        populateDoctorName(savedAppt);
        return savedAppt;
    }

    public void populateDoctorNames(java.util.List<Appointment> appointments) {
        if (appointments == null || appointments.isEmpty()) {
            return;
        }
        java.util.Map<Long, Doctor> doctorMap = doctorRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Doctor::getId, doc -> doc, (a, b) -> a));
        java.util.Map<Long, User> patientMap = userRepository.findAll().stream()
                .filter(u -> "PATIENT".equals(u.getRole()))
                .collect(java.util.stream.Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        for (Appointment appt : appointments) {
            if (appt.getDoctorId() != null) {
                Doctor doc = doctorMap.get(appt.getDoctorId());
                if (doc != null) {
                    appt.setDoctorName(doc.getName());
                    appt.setDoctorCode(doc.getDoctorCode());
                } else {
                    appt.setDoctorName("Unknown Doctor");
                    appt.setDoctorCode("N/A");
                }
            }
            if (appt.getPatientId() != null) {
                User patient = patientMap.get(appt.getPatientId());
                if (patient != null) {
                    appt.setPatientCode(patient.getPatientCode());
                } else {
                    appt.setPatientCode("N/A");
                }
            }
        }
    }

    public void populateDoctorName(Appointment appointment) {
        if (appointment == null) {
            return;
        }
        if (appointment.getDoctorId() != null) {
            doctorRepository.findById(appointment.getDoctorId()).ifPresent(doc -> {
                appointment.setDoctorName(doc.getName());
                appointment.setDoctorCode(doc.getDoctorCode());
            });
        }
        if (appointment.getPatientId() != null) {
            userRepository.findById(appointment.getPatientId()).ifPresent(u -> {
                appointment.setPatientCode(u.getPatientCode());
            });
        }
    }
}

