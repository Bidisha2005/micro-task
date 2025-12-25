# Micro-Contract Work Platform 🚀

A full-stack, role-based micro-contract platform designed to manage short-term tasks efficiently.  
This platform connects **Workers**, **Companies**, and **Admins** through a secure and structured workflow, ensuring transparency, fairness, and accountability.

---

## 🌟 Overview

The Micro-Contract Work Platform allows companies to post short-term tasks and hire skilled workers to complete them.  
Workers can browse tasks, apply easily, submit work, and track earnings, while admins ensure platform integrity through moderation and verification.

This project focuses on **real-world system design**, **secure role-based access**, and **clear task lifecycle management**.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication & Security:**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-Based Access Control (RBAC)

---

## 👥 User Roles & Features

### 🧑‍💻 Worker
- Browse available tasks with filters (search, pay range, duration)
- Apply to tasks with a single click
- Submit work (text or file links)
- Manage profile, skills, and availability
- Track earnings, completed tasks, and payment history

---

### 🏢 Company
- Create tasks with budget, deadline, and required skills
- Review worker applications and proposals
- Accept, reject, or request revisions for submissions
- Manage company profile and verification status
- View payment history for completed tasks

---

### 🛡️ Admin
- Monitor overall platform activity and health
- Manage users (view details, change roles, block/unblock)
- Verify company profiles before activation
- Moderate tasks before they go live
- Track and review all financial transactions

---

## 🔄 Key Workflows

### 📌 Task Lifecycle

Draft → Pending Approval → Open → Assigned → Submitted → Completed


Each task follows a structured lifecycle to ensure accountability and smooth execution.

---

### 💰 Payment Escrow Logic
- Payment is marked **Pending** when a task is assigned
- Payment is **Confirmed** only after work is accepted
- This protects both workers and companies

---

### ⚡ Real-Time Updates
- Task status updates reflect instantly in the UI
- Workers and companies always see the latest task state

---

## 📸 Screenshots

_Add 2–3 screenshots here to showcase:_
- Worker Dashboard  
- Company Task Management  
- Admin Panel  

(You can place images like this)

```md
![Worker Dashboard](./screenshots/worker-dashboard.png)
![Company Dashboard](./screenshots/company-dashboard.png)
![Admin Dashboard](./screenshots/admin-dashboard.png)
