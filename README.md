<div align="center">
  
  # 🎓 Assignment Management System
  
  **An enterprise-grade, role-based platform for orchestrating educational workflows and coursework lifecycles.**

  [![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core_8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
  [![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

  *Developed and maintained by **Md Shefat Al Mahmud**.*

</div>

---

## 📑 Table of Contents
- [About The Project](#-about-the-project)
- [Core Features & Capabilities](#-core-features--capabilities)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Future Roadmap](#-future-roadmap)
- [Getting Started](#-getting-started)
- [Demo Environment](#-demo-environment)

---

## 🚀 About The Project

The **Assignment Management System** is a robust, full-stack web application designed to bridge the gap between educational administration, faculty, and students. By providing a secure, centralized digital workspace, this platform eliminates the friction of traditional assignment tracking. It ensures that curriculum structuring, assignment distribution, grading workflows, and coursework submissions are handled with efficiency, transparency, and strict access controls.

---

## ✨ Core Features & Capabilities

The system is built on a foundation of strict **Role-Based Access Control (RBAC)**, ensuring data privacy and operational security across three distinct user tiers.

### 🛡️ Administrator Operations
- **Curriculum & Taxonomy Management:** Full lifecycle management (CRUD) over courses, academic departments, and individual subjects.
- **Identity & Access Management (IAM):** Secure provisioning, modification, and suspension of Teacher and Student accounts.
- **System Oversight:** Global dashboard view providing insights into system-wide activity, user metrics, and platform health.

### 👨‍🏫 Faculty & Teacher Controls
- **Assignment Lifecycle Management:** Draft, publish, and schedule assignments with precise deadlines and detailed instructions.
- **Evaluation & Grading Engine:** Comprehensive tools to review student submissions, assign scores, and provide constructive, rich-text feedback.
- **Cohort Analytics:** Monitor class-wide performance trends, track missing submissions, and identify at-risk students through a centralized dashboard.

### 🎓 Student Workspace
- **Centralized Dashboard:** A personalized hub displaying upcoming deadlines, pending assignments, and recent academic evaluations.
- **Secure Submissions:** Streamlined, secure upload mechanism for coursework and assignment deliverables with confirmation receipts.
- **Academic Progress Tracking:** Historical visibility into personal academic performance and graded feedback across all enrolled courses.

### 🔒 Core Security & Infrastructure
- **JWT-Based Authentication:** Stateless, secure session management using JSON Web Tokens.
- **Data Integrity:** Comprehensive relational constraints and referential integrity maintained via PostgreSQL and EF Core.
- **API Security:** Centralized exception handling, input validation, and secure CORS policies.

---

## 🏛 System Architecture

The application is engineered with enterprise scalability, maintainability, and testability in mind, strictly adhering to **SOLID** principles and Clean Architecture design patterns.

- **N-Tier (Clean) Architecture:** 
  The backend ecosystem is strictly partitioned into Presentation, Business Logic, and Data Access layers. Controllers act merely as thin routing mechanisms, delegating all operations to robust, isolated service layers.
- **Generic Repository Pattern (`IGenericRepository<T>`):** 
  Database operations are completely abstracted. This minimizes boilerplate, centralizes Entity Framework Core interactions, and makes the core business logic highly testable without database dependencies.
- **Dependency Injection:** 
  Leveraged extensively throughout the .NET Core pipeline to decouple concrete implementations and manage object lifecycles efficiently.
- **Axios Interceptors:** 
  The Next.js frontend implements global HTTP interceptors. This ensures JWT tokens are seamlessly attached to all outgoing authenticated requests, while providing a centralized mechanism for intercepting 401 Unauthorized responses and global error handling.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | ASP.NET Core Web API (.NET 10), Entity Framework Core, JWT Auth |
| **Frontend Client** | Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons |
| **Database** | PostgreSQL |
| **Testing** | xUnit, Moq |
| **Containerization** | Docker, Docker Compose |

---

## ⚙️ Getting Started

Follow these instructions to deploy the application in a local development environment.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v18 or higher)](https://nodejs.org/)

### 1. Initialize the Database
From the root directory, launch the PostgreSQL database container:
```bash
docker-compose up -d
```

### 2. Configure and Run the Backend API
Navigate to the backend directory:
```bash
cd backend
```
*(Optional)* Verify the database connection string located in `appsettings.json`. Apply EF Core database migrations and start the server:
```bash
dotnet ef database update
dotnet run
```
> The API will be accessible at `http://localhost:5000`

### 3. Configure and Run the Frontend Client
Open a secondary terminal and navigate to the frontend directory:
```bash
cd frontend
```
Install all required npm dependencies:
```bash
npm install
```
Create a local environment variables file (`.env.local`) in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Start the Next.js development server:
```bash
npm run dev
```
> The frontend client will be accessible at `http://localhost:3000`

---