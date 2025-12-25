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
#### Worker Dashboard
![img alt](https://github.com/Bidisha2005/micro-task/blob/main/Screenshot%202025-12-25%20171458.png?raw=true)

---

### 🏢 Company
- Create tasks with budget, deadline, and required skills
- Review worker applications and proposals
- Accept, reject, or request revisions for submissions
- Manage company profile and verification status
- View payment history for completed tasks
#### Company Dashboard-
![img alt](https://github.com/Bidisha2005/micro-task/blob/main/Screenshot%202025-12-25%20171418.png?raw=true)

---

### 🛡️ Admin
- Monitor overall platform activity and health
- Manage users (view details, change roles, block/unblock)
- Verify company profiles before activation
- Moderate tasks before they go live
- Track and review all financial transactions
#### Admin Dashboard-
![image alt](https://github.com/Bidisha2005/micro-task/blob/main/Screenshot%202025-12-25%20171328.png?raw=true)

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
### Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Bidisha2005/micro-task.git

# Frontend:npm install
npm run dev

#Backend:npm install
npm run dev

# Application will be available at:
# Backend:  http://localhost:5000
# Frontend: http://localhost:3000
```
## 👤 Author

**Bidisha Kundu**
- GitHub: [@Bidisha2005](https://github.com/Bidisha2005)
- LinkedIn: [Bidisha Kundu](https://www.linkedin.com/in/bidisha-kundu-41706428b/)

---
<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with ❤️ , by Bidisha

</div>







