# VitaPulse Hospital Management System - Deployment Guide

This guide provides instructions to configure, initialize, and deploy the VitaPulse Hospital Management System from scratch.

## Project Stack Overview
- **Frontend:** React (Vite) — Deployed on **Vercel**
- **Backend:** Spring Boot (Java 17+) — Deployed on **Railway**
- **Database:** PostgreSQL — Provisioned via **Supabase**

---

## Part 1: Supabase Database Setup

1. **Create a Supabase Project:**
   - Log in to [Supabase](https://supabase.com/).
   - Click **New Project**, select an organization, name your project `VitaPulse`, set a strong database password, and choose a region.

2. **Initialize the Schema:**
   - In Supabase, go to the **SQL Editor** from the left navigation bar.
   - Click **New Query**.
   - Copy the contents of the `src/main/resources/schema.sql` file and run it. This will drop any existing tables and construct PostgreSQL-compatible tables (`users`, `doctors`, `patients`, `doctor_slots`, `appointments`, `feedback`, `audit_logs`).

3. **Insert Seed Data:**
   - Open another **New Query** tab in the SQL Editor.
   - Copy the contents of the `src/main/resources/data.sql` file and run it. This populates your database with:
     - An Admin account: `admin@vitapulse.io` (Password: `admin123`)
     - Default doctors, patients, doctor slots, appointments, feedback records, and audit logs.

4. **Obtain Connection String:**
   - Go to **Project Settings** > **Database**.
   - Locate the **Connection string** section, select **URI** (or JDBC), and copy the URI. 
   - *Example format:* `postgresql://postgres:<your-password>@db.<your-project-id>.supabase.co:5432/postgres`

---

## Part 2: Railway Backend Deployment

Railway uses Nixpacks to auto-detect and build the Spring Boot Maven project.

1. **Deploy from GitHub:**
   - Log in to [Railway](https://railway.app/).
   - Click **New Project** > **Deploy from GitHub repo** and select your `VitaPulse` repository.

2. **Set Root Directory:**
   - In the service settings on Railway, set the root directory of the backend to: 
     `College Project/hospital-management/hospital-management`
     *(This ensures Railway builds the folder containing `pom.xml` rather than the root directory).*

3. **Add Environment Variables:**
   Under the **Variables** tab of the service, add the following key-value pairs:
   
   | Variable Name | Description | Example Value |
   | --- | --- | --- |
   | `SPRING_DATASOURCE_URL` | JDBC PostgreSQL connection string | `jdbc:postgresql://db.<id>.supabase.co:5432/postgres?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | Supabase DB Username | `postgres` |
   | `SPRING_DATASOURCE_PASSWORD` | Supabase DB Password | `your_db_password` |
   | `PORT` | Running Port | `8080` (Railway injects this automatically) |
   | `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
   | `MAIL_USERNAME` | Gmail SMTP username email | `your_gmail@gmail.com` |
   | `MAIL_PASSWORD` | Gmail App Password (16-char code) | `gdzykggwbswbczoy` |
   | `JWT_SECRET` | Secret key for signing JWTs | `atleast32characterlongsecurekeyhere` |

4. **Deploy:**
   - Click **Deploy**. Railway will run Maven compilation, package the project into a `.jar` file, and deploy it.
   - Generate a **Public Domain** under the **Settings** tab (e.g., `https://vitapulse-production.up.railway.app`). Note this URL; you will need it for the frontend configuration.

---

## Part 3: Vercel Frontend Deployment

1. **Import Project:**
   - Log in to [Vercel](https://vercel.com/).
   - Click **Add New** > **Project** and import your `VitaPulse` repository.

2. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `hospital-management-ui`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Add Environment Variables:**
   Add the following environment variable under the project configuration screen:
   
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://vitapulse-production.up.railway.app` *(Your production Railway backend URL)*

4. **Deploy:**
   - Click **Deploy**. Vercel will build the frontend files and publish them.
   - **React Router Support:** The file `hospital-management-ui/vercel.json` already contains rewrite rules that rewrite all page requests to `index.html`. This ensures that refreshing routes like `/dashboard` or `/doctors` directly will not return a Vercel 404 NOT_FOUND error.

---

## Part 4: Local Execution Guide

To run the application locally on your computer with your PostgreSQL credentials:

1. **Run Backend:**
   - Navigate to the backend directory `College Project/hospital-management/hospital-management`.
   - Update your credentials in your local `.env` file (which is ignored by Git).
   - In PowerShell, run:
     ```powershell
     # Load variables
     Get-Content .env | Foreach-Object {
         if ($_ -match "^([^=]+)=(.*)$") {
             [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2])
         }
     }
     # Start backend
     ./mvnw spring-boot:run
     ```

2. **Run Frontend:**
   - Navigate to `College Project/hospital-management/hospital-management/hospital-management-ui`.
   - Start the Vite server:
     ```bash
     npm run dev
     ```
