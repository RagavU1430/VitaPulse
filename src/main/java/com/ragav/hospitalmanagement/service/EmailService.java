package com.ragav.hospitalmanagement.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EmailService.class);

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAppointmentBookedEmail(String patientName, String patientEmail, String doctorName,
            String appointmentDate, String appointmentTime) {
        try {
            logger.info("Preparing BOOKED email for patient: {}, email: {}", patientName, patientEmail);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(patientEmail);
            message.setSubject("Appointment Confirmation - VitaPulse Hospital");
            message.setText("Dear " + patientName + ",\n\n" +
                    "Your appointment has been successfully booked.\n\n" +
                    "Doctor:\n" + doctorName + "\n\n" +
                    "Date:\n" + appointmentDate + "\n\n" +
                    "Time:\n" + appointmentTime + "\n\n" +
                    "Please arrive 10 minutes before your scheduled appointment.\n\n" +
                    "Thank you,\n" +
                    "VitaPulse Hospital");
            mailSender.send(message);
            logger.info("Successfully sent BOOKED email notification to {}", patientEmail);
        } catch (Exception e) {
            logger.error("Failed to send BOOKED email notification to {}", patientEmail, e);
        }
    }

    public void sendAppointmentCancelledEmail(String patientName, String patientEmail, String doctorName,
            String appointmentDate, String appointmentTime) {
        try {
            logger.info("Preparing CANCELLED email for patient: {}, email: {}", patientName, patientEmail);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(patientEmail);
            message.setSubject("Appointment Cancelled - VitaPulse Hospital");
            message.setText("Dear " + patientName + ",\n\n" +
                    "Your appointment has been cancelled.\n\n" +
                    "Doctor:\n" + doctorName + "\n\n" +
                    "Date:\n" + appointmentDate + "\n\n" +
                    "Time:\n" + appointmentTime + "\n\n" +
                    "If required, please schedule another appointment.\n\n" +
                    "Thank you,\n" +
                    "VitaPulse Hospital");
            mailSender.send(message);
            logger.info("Successfully sent CANCELLED email notification to {}", patientEmail);
        } catch (Exception e) {
            logger.error("Failed to send CANCELLED email notification to {}", patientEmail, e);
        }
    }

    public void sendAppointmentCompletedEmail(String patientName, String patientEmail, String doctorName,
            String appointmentDate, String appointmentTime) {
        try {
            logger.info("Preparing COMPLETED email for patient: {}, email: {}", patientName, patientEmail);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(patientEmail);
            message.setSubject("Consultation Completed - VitaPulse Hospital");
            message.setText("Dear " + patientName + ",\n\n" +
                    "Your consultation has been marked as completed.\n\n" +
                    "Doctor:\n" + doctorName + "\n\n" +
                    "Date:\n" + appointmentDate + "\n\n" +
                    "Time:\n" + appointmentTime + "\n\n" +
                    "We wish you good health.\n\n" +
                    "Thank you,\n" +
                    "VitaPulse Hospital");
            mailSender.send(message);
            logger.info("Successfully sent COMPLETED email notification to {}", patientEmail);
        } catch (Exception e) {
            logger.error("Failed to send COMPLETED email notification to {}", patientEmail, e);
        }
    }
}
