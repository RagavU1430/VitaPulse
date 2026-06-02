-- Supabase PostgreSQL Database Setup Script for VitaPulse Hospital Management System

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS doctor_slots CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. TABLES DEFINITIONS
-- =====================================================================

-- 1. Users table (Stores credentials and basic identity for all users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR', 'PATIENT')),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Doctors table (Linked to users table)
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience INTEGER NOT NULL CHECK (experience >= 0),
    consultation_fee DECIMAL(10, 2) NOT NULL CHECK (consultation_fee >= 0.00),
    availability_status BOOLEAN NOT NULL DEFAULT true
);

-- 3. Patients table (Linked to users table)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER NOT NULL CHECK (age >= 0),
    gender VARCHAR(50) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10),
    medical_history TEXT
);

-- 4. Doctor Slots table (Timeslots available for scheduling)
CREATE TABLE doctor_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    available BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (doctor_id, slot_date, slot_time)
);

-- 5. Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('BOOKED', 'CANCELLED', 'COMPLETED')) DEFAULT 'BOOKED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- 2. INDEXES DEFINITIONS (For performance optimization)
-- =====================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_doctor_slots_lookup ON doctor_slots(doctor_id, slot_date, available);
CREATE INDEX idx_appointments_lookup ON appointments(doctor_id, appointment_date, status);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_feedback_doctor ON feedback(doctor_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- =====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id OR role = 'ADMIN');

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Doctors Table Policies
CREATE POLICY "Anyone can view doctor listings" ON doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors and Admins can update doctor profiles" ON doctors
    FOR UPDATE USING (auth.uid() = user_id OR (auth.jwt() ->> 'role' = 'ADMIN'));

-- Patients Table Policies
CREATE POLICY "Patients can view/update their own profile" ON patients
    FOR ALL USING (auth.uid() = user_id OR (auth.jwt() ->> 'role' = 'ADMIN') OR (auth.jwt() ->> 'role' = 'DOCTOR'));

-- Doctor Slots Policies
CREATE POLICY "Anyone can view available slots" ON doctor_slots
    FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their slots" ON doctor_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM doctors d 
            WHERE d.id = doctor_slots.doctor_id AND d.user_id = auth.uid()
        ) OR (auth.jwt() ->> 'role' = 'ADMIN')
    );

-- Appointments Policies
CREATE POLICY "Patients can manage their own appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view/update their appointments" ON appointments
    FOR SELECT-UPDATE USING (
        EXISTS (
            SELECT 1 FROM doctors d 
            WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid()
        ) OR (auth.jwt() ->> 'role' = 'ADMIN')
    );

-- Feedback Policies
CREATE POLICY "Anyone can view feedback ratings" ON feedback
    FOR SELECT USING (true);

CREATE POLICY "Patients can write feedback for their doctors" ON feedback
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = feedback.patient_id AND p.user_id = auth.uid()
        )
    );

-- Audit Logs Policies
CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

-- =====================================================================
-- 4. SAMPLE SEED DATA
-- =====================================================================

-- Note: Passwords are BCrypt-encrypted hashes of 'admin123', 'doctor123', 'patient123'
-- Admin user ID
INSERT INTO users (id, full_name, email, password, role, phone) VALUES
('a0000000-0000-0000-0000-000000000001', 'VitaPulse Admin', 'admin@vitapulse.io', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'ADMIN', '+1-555-0100');

-- Doctor User and profile IDs
INSERT INTO users (id, full_name, email, password, role, phone) VALUES
('d0000000-0000-0000-0000-000000000001', 'Dr. Aisha Khan', 'aisha.khan@vitapulse.io', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'DOCTOR', '+1-555-0192');

INSERT INTO doctors (id, user_id, specialization, qualification, experience, consultation_fee, availability_status) VALUES
('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Cardiology', 'MD, FACC', 12, 150.00, true);

-- Patient User and profile IDs
INSERT INTO users (id, full_name, email, password, role, phone) VALUES
('p0000000-0000-0000-0000-000000000001', 'Olivia Bennett', 'olivia@example.com', '$2a$10$83JjVbL6aQ1cT2w.W8xV.O4yvBuxQ7FmQ24F9K15qKxWJ6X.7Jt4q', 'PATIENT', '+1-555-2311');

INSERT INTO patients (id, user_id, age, gender, blood_group, medical_history) VALUES
('c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 28, 'Female', 'O+', 'No chronic illness. Minor asthma in childhood.');

-- Seed default Slots for Dr. Aisha
INSERT INTO doctor_slots (id, doctor_id, slot_date, slot_time, available) VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026-06-03', '10:00:00', true),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '2026-06-03', '11:00:00', false),
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '2026-06-03', '14:00:00', true);

-- Seed default Appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES
('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026-06-03', '11:00:00', 'BOOKED', 'Routine cardiology consultation checkup');

-- Seed mock Feedback
INSERT INTO feedback (patient_id, doctor_id, rating, comments, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 5, 'Compassionate and incredibly thorough. Best cardiologist I''ve met.', '2026-05-28 14:32:00-00');

-- Seed mock Audit logs
INSERT INTO audit_logs (user_id, action, description) VALUES
('a0000000-0000-0000-0000-000000000001', 'Updated doctor profile', 'Updated Dr. Aisha Khan specialization details');
