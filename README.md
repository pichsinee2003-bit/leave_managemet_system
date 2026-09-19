# 📅 Enterprise Leave Management System (ระบบบริหารจัดการการลา)

ระบบบริหารจัดการการลาของพนักงานในองค์กรแบบคลาวด์ พัฒนาขึ้นเพื่อตอบสนองการคำนวณวันลา โควตาการลาตามกฎหมายแรงงานไทย การอนุมัติคำขอลา และการเชื่อมโยงข้อมูลวันลาเข้ากับระบบคำนวณเงินเดือนอัตโนมัติ (Payroll Integration)

🌐 **Live Production URL:** 

---

## 📌 บทสรุปภาพรวมโครงการ (Executive Summary)

โครงการนี้พัฒนาขึ้นเพื่อเพิ่มประสิทธิภาพและขยายขอบเขตการทำงานของระบบบริหารจัดการเงินเดือน ให้ครอบคลุมมิติของการลาและการขาดงาน โดยแก้ไขปัญหาความซ้ำซ้อนและความผิดพลาดในการหักเงินเดือนกรณีลาเกินสิทธิ์หรือลาไม่ได้รับค่าจ้าง โดยแบ่งการทำงานออกเป็น 2 มุมมองหลัก:

1. **HR Management Portal:** แผงควบคุมสำหรับฝ่ายบุคคลและหัวหน้างาน บริหารจัดการประเภทวันลาและโควตาพนักงาน ตรวจสอบ ออนุมัติ/ปฏิเสธคำขอลา และมอนิเตอร์ภาพรวมสถิติมิติต่าง ๆ ของการลาในองค์กร
2. **Employee Self-Service Portal:** หน้าต่างบริการตนเองของพนักงาน ตรวจสอบโควตาวันลาคงเหลือ ยื่นคำขอลาออนไลน์ พร้อมแนบเอกสารประกอบ (เช่น ใบรับรองแพทย์) และตรวจสอบสถานะคำขอลาของตนเองแบบเรียลไทม์

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack & Architecture)

* **Frontend Framework:** Next.js (App Router, Static HTML Export)
* **Styling:** Tailwind CSS (Modern Card/Modal Design, Responsive, Print Media Queries)
* **Backend & Database:** Supabase (PostgreSQL 15 + GoTrue Authentication)
* **Storage:** Supabase Storage (สำหรับจัดเก็บไฟล์แนบ/ใบรับรองแพทย์)

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema & Relations)

ฐานข้อมูลได้รับการออกแบบตามมาตรฐาน Relational Database (3NF) เพื่อความถูกต้องของข้อมูล (Data Integrity):

### 1. leave_types (ประเภทการลาในองค์กร)
* `id` (UUID, Primary Key)
* `name` (TEXT เช่น ลาพักร้อน, ลาป่วย, ลากิจ, ลาไม่ได้รับค่าจ้าง)
* `default_days` (INTEGER - จำนวนวันเริ่มต้นตามสิทธิ์ต่อปี)
* `is_paid` (BOOLEAN - ได้รับค่าจ้างหรือไม่)

### 2. leave_requests (คำขอลาของพนักงาน)
* `id` (UUID, Primary Key)
* `employee_id` (UUID, Foreign Key -> `employees.id`)
* `leave_type_id` (UUID, Foreign Key -> `leave_types.id`)
* `start_date` (DATE, NOT NULL)
* `end_date` (DATE, NOT NULL)
* `total_days` (NUMERIC - จำนวนวันที่ลาจริง ไม่นับวันหยุด)
* `reason` (TEXT - เหตุผลการลา)
* `attachment_url` (TEXT - ลิงก์ไฟล์แนบใน Supabase Storage)
* `status` (ENUM: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`)
* `approver_id` (UUID, Foreign Key -> `employees.id` - ผู้อนุมัติ)
* `created_at` (TIMESTAMP)

### 3. leave_balances (โควตาวันลาคงเหลือรายบุคคล)
* `id` (UUID, Primary Key)
* `employee_id` (UUID, Foreign Key -> `employees.id`)
* `leave_type_id` (UUID, Foreign Key -> `leave_types.id`)
* `year` (INTEGER - ปี พ.ศ./ค.ศ.)
* `total_quota` (NUMERIC - สิทธิ์ทั้งหมดในปีนี้)
* `used_days` (NUMERIC - ใช้ไปแล้ว)
* `remaining_days` (NUMERIC - คงเหลือ)

---

## ⚙️ ตรรกะการคำนวณและการเชื่อมโยงระบบ (Business Logic Specification)

ระบบประมวลผลวันลาพัฒนาขึ้นตามข้อกำหนดของกฎหมายแรงงานไทย:

1. **การคำนวณโควตาสิทธิ์อัตโนมัติ:** ระบบจะประเมินสิทธิ์วันลาพักร้อนตามอายุงาน หรือสิทธิ์ลาป่วยตามระเบียบบริษัท
2. **การหักเงินเดือนกรณีลาไม่ได้รับค่าจ้าง (Unpaid Leave Deduction):** หากพนักงานลาเกินสิทธิ์หรือลาแบบไม่ได้รับค่าจ้าง (`is_paid = false`) ระบบคำนวณเงินเดือน (`Calculation Engine`) จะนำจำนวนวันลาไปหักออกจากฐานเงินเดือน (`base_salary`) ในรอบบัญชีนั้น ๆ โดยอัตโนมัติ
3. **การล็อกข้อมูลเพื่อความปลอดภัย (Data Integrity & Immutability):** เมื่อรอบบัญชีเงินเดือนถูกปิดงวดแล้ว ประวัติการลาที่นำไปประมวลผลจะถูกล็อกสถานะเพื่อป้องกันการแก้ไขย้อนหลัง รักษาความถูกต้องของบัญชีองค์กร
