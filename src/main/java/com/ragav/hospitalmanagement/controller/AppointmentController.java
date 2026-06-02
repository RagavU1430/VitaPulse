package com.ragav.hospitalmanagement.controller;

import com.ragav.hospitalmanagement.dto.BookAppointmentRequest;
import com.ragav.hospitalmanagement.entity.Appointment;
import com.ragav.hospitalmanagement.entity.User;
import com.ragav.hospitalmanagement.entity.Doctor;
import com.ragav.hospitalmanagement.repository.AppointmentRepository;
import com.ragav.hospitalmanagement.repository.UserRepository;
import com.ragav.hospitalmanagement.repository.DoctorRepository;
import com.ragav.hospitalmanagement.service.AppointmentService;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Element;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import java.awt.Color;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AppointmentController.class);

    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    // Constructor injection
    public AppointmentController(AppointmentRepository appointmentRepository, 
                                 AppointmentService appointmentService,
                                 UserRepository userRepository,
                                 DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
    }

    // GET /appointments - Return all appointments
    @GetMapping
    public List<Appointment> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        appointmentService.populateDoctorNames(appointments);
        return appointments;
    }

    // POST /appointments - Create an appointment directly
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentRepository.save(appointment);
        appointmentService.populateDoctorName(savedAppointment);
        return new ResponseEntity<>(savedAppointment, HttpStatus.CREATED);
    }

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody BookAppointmentRequest request) {

        Appointment appointment = appointmentService.bookAppointment(
                request.getDoctorId(),
                request.getSlotId(),
                request.getPatientId());

        return new ResponseEntity<>(appointment, HttpStatus.CREATED);
    }

    // GET /appointments/{id} - Return appointment by id
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointmentService.populateDoctorName(appointment);
                    return ResponseEntity.ok(appointment);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /appointments/{id} - Delete appointment by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointmentById(@PathVariable Long id) {
        if (!appointmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        appointmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // DELETE /appointments/cancel/{id} - Cancel appointment (and free DoctorSlot)
    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok("Appointment Cancelled Successfully");
    }

    // PUT /appointments/complete/{id} - Complete appointment
    @PutMapping("/complete/{id}")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Long id) {
        Appointment updated = appointmentService.completeAppointment(id);
        return ResponseEntity.ok(updated);
    }

    // GET /appointments/doctor/{doctorId} - Find appointments by doctor ID
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctorId(@PathVariable Long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        appointmentService.populateDoctorNames(appointments);
        return appointments;
    }

    // GET /appointments/patient/{patientId} - Find appointments by patient ID
    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatientId(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        appointmentService.populateDoctorNames(appointments);
        return appointments;
    }

    // GET /appointments/status/{status} - Find appointments by status
    @GetMapping("/status/{status}")
    public List<Appointment> getAppointmentsByStatus(@PathVariable String status) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        appointmentService.populateDoctorNames(appointments);
        return appointments;
    }

    // GET /appointments/{id}/receipt - Generate and return PDF receipt
    @GetMapping("/{id}/receipt")
    public void generateReceipt(@PathVariable Long id, 
                                jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        logger.info("Attempting to generate receipt for appointment ID: {}", id);
        
        Optional<Appointment> apptOpt = appointmentRepository.findById(id);
        if (apptOpt.isEmpty()) {
            logger.warn("Appointment ID {} not found in database.", id);
            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("text/plain");
            response.getWriter().write("Receipt not available.");
            return;
        }
        Appointment appt = apptOpt.get();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            logger.warn("Request is unauthorized or unauthenticated.");
            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain");
            response.getWriter().write("Unauthorized access.");
            return;
        }

        String email = (String) auth.getPrincipal();
        Optional<User> currentUserOpt = userRepository.findByEmail(email);
        if (currentUserOpt.isEmpty()) {
            logger.warn("Authenticated email {} does not exist in users table.", email);
            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("text/plain");
            response.getWriter().write("Access denied.");
            return;
        }
        User currentUser = currentUserOpt.get();
        logger.info("Current user: id={}, email={}, role={}", currentUser.getId(), currentUser.getEmail(), currentUser.getRole());
        logger.info("Appointment details: patientId={}, doctorId={}, status={}", appt.getPatientId(), appt.getDoctorId(), appt.getStatus());

        String role = currentUser.getRole();
        if ("ADMIN".equals(role)) {
            logger.info("Access granted: ADMIN can download any receipt.");
        } else if ("PATIENT".equals(role)) {
            if (!appt.getPatientId().equals(currentUser.getId())) {
                logger.warn("Access denied: Patient user ID {} mismatch with appointment patient ID {}.", 
                        currentUser.getId(), appt.getPatientId());
                response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("text/plain");
                response.getWriter().write("Access denied: You can only download your own receipt.");
                return;
            }
        } else if ("DOCTOR".equals(role)) {
            Optional<Doctor> doctorOptForUser = doctorRepository.findByEmail(currentUser.getEmail());
            if (doctorOptForUser.isEmpty() || !appt.getDoctorId().equals(doctorOptForUser.get().getId())) {
                logger.warn("Access denied: Doctor profile resolved by email {} has ID {} mismatch with appointment doctor ID {}.", 
                        currentUser.getEmail(), doctorOptForUser.map(Doctor::getId).orElse(null), appt.getDoctorId());
                response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("text/plain");
                response.getWriter().write("Access denied: You can only view receipts for your own appointments.");
                return;
            }
        } else {
            logger.warn("Access denied: Unknown role {} for user {}", role, currentUser.getEmail());
            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("text/plain");
            response.getWriter().write("Access denied.");
            return;
        }

        Optional<User> patientOpt = userRepository.findById(appt.getPatientId());
        Optional<Doctor> doctorOpt = doctorRepository.findById(appt.getDoctorId());

        String patientName = patientOpt.map(User::getName).orElse("Unknown Patient");
        String patientEmail = patientOpt.map(User::getEmail).orElse("N/A");
        String doctorName = doctorOpt.map(Doctor::getName).orElse("Unknown Doctor");
        String doctorSpec = doctorOpt.map(Doctor::getSpecialization).orElse("N/A");

        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=Appointment_Receipt_" + id + ".pdf";
        response.setHeader(headerKey, headerValue);

        Document document = new Document();
        try {
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(26, 95, 122));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(21, 152, 149));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.DARK_GRAY);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY);

            Paragraph hospitalName = new Paragraph("VitaPulse Hospital", titleFont);
            hospitalName.setAlignment(Element.ALIGN_CENTER);
            document.add(hospitalName);

            Paragraph receiptTitle = new Paragraph("Appointment Receipt", subtitleFont);
            receiptTitle.setAlignment(Element.ALIGN_CENTER);
            receiptTitle.setSpacingAfter(20);
            document.add(receiptTitle);

            Paragraph line = new Paragraph("----------------------------------------------------------------------------------------------------------------------------------", normalFont);
            line.setSpacingAfter(15);
            document.add(line);

            Paragraph patientHeader = new Paragraph("Patient Information", subtitleFont);
            patientHeader.setSpacingAfter(8);
            document.add(patientHeader);

            PdfPTable patientTable = new PdfPTable(2);
            patientTable.setWidthPercentage(100);
            patientTable.setSpacingAfter(15);
            patientTable.addCell(new PdfPCell(new Paragraph("Name:", boldFont)));
            patientTable.addCell(new PdfPCell(new Paragraph(patientName, normalFont)));
            patientTable.addCell(new PdfPCell(new Paragraph("Email:", boldFont)));
            patientTable.addCell(new PdfPCell(new Paragraph(patientEmail, normalFont)));
            for (PdfPCell cell : patientTable.getRows().stream().flatMap(r -> java.util.Arrays.stream(r.getCells())).collect(Collectors.toList())) {
                if (cell != null) cell.setBorder(PdfPCell.NO_BORDER);
            }
            document.add(patientTable);

            Paragraph doctorHeader = new Paragraph("Doctor Information", subtitleFont);
            doctorHeader.setSpacingAfter(8);
            document.add(doctorHeader);

            PdfPTable doctorTable = new PdfPTable(2);
            doctorTable.setWidthPercentage(100);
            doctorTable.setSpacingAfter(15);
            doctorTable.addCell(new PdfPCell(new Paragraph("Doctor:", boldFont)));
            doctorTable.addCell(new PdfPCell(new Paragraph(doctorName, normalFont)));
            doctorTable.addCell(new PdfPCell(new Paragraph("Specialization:", boldFont)));
            doctorTable.addCell(new PdfPCell(new Paragraph(doctorSpec, normalFont)));
            for (PdfPCell cell : doctorTable.getRows().stream().flatMap(r -> java.util.Arrays.stream(r.getCells())).collect(Collectors.toList())) {
                if (cell != null) cell.setBorder(PdfPCell.NO_BORDER);
            }
            document.add(doctorTable);

            Paragraph apptHeader = new Paragraph("Appointment Information", subtitleFont);
            apptHeader.setSpacingAfter(8);
            document.add(apptHeader);

            PdfPTable apptTable = new PdfPTable(2);
            apptTable.setWidthPercentage(100);
            apptTable.setSpacingAfter(25);
            apptTable.addCell(new PdfPCell(new Paragraph("Appointment ID:", boldFont)));
            apptTable.addCell(new PdfPCell(new Paragraph("#" + appt.getId(), normalFont)));
            apptTable.addCell(new PdfPCell(new Paragraph("Date:", boldFont)));
            apptTable.addCell(new PdfPCell(new Paragraph(appt.getAppointmentDate().toString(), normalFont)));
            apptTable.addCell(new PdfPCell(new Paragraph("Time:", boldFont)));
            apptTable.addCell(new PdfPCell(new Paragraph(appt.getAppointmentTime().toString(), normalFont)));
            apptTable.addCell(new PdfPCell(new Paragraph("Status:", boldFont)));
            apptTable.addCell(new PdfPCell(new Paragraph(appt.getStatus(), normalFont)));
            for (PdfPCell cell : apptTable.getRows().stream().flatMap(r -> java.util.Arrays.stream(r.getCells())).collect(Collectors.toList())) {
                if (cell != null) cell.setBorder(PdfPCell.NO_BORDER);
            }
            document.add(apptTable);

            Paragraph generatedTime = new Paragraph("Generated: " + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), footerFont);
            generatedTime.setSpacingAfter(15);
            document.add(generatedTime);

            document.add(line);

            Paragraph thankYou = new Paragraph("Thank you for choosing VitaPulse Hospital.", boldFont);
            thankYou.setAlignment(Element.ALIGN_CENTER);
            thankYou.setSpacingBefore(10);
            document.add(thankYou);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            document.close();
        }
    }
}
