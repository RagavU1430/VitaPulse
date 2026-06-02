-- PostgreSQL-compatible schema for VitaPulse Hospital Management System

-- Drop tables in reverse order of dependencies to allow clean re-run if needed
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_slots CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table (stores admins, patients, staff)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    patient_code VARCHAR(50)
);

-- 2. Doctors table
CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    experience INTEGER NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    doctor_code VARCHAR(50)
);

-- 3. Patients table (legacy support)
CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(50) NOT NULL
);

-- 4. Doctor Slots table
CREATE TABLE doctor_slots (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    available BOOLEAN NOT NULL
);

-- 5. Appointments table
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- 6. Feedback table (matching frontend mock structure)
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    patient VARCHAR(255) NOT NULL,
    doctor VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date DATE DEFAULT CURRENT_DATE
);

-- 7. Audit Logs table (matching frontend mock structure)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    ip VARCHAR(50) NOT NULL,
    at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
