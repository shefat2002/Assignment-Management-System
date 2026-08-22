# Missing Project Requirements & Implementation Plan

This document outlines the missing requirements, architectural changes, and new features that need to be implemented to align with the final project goals. They are ordered by priority, starting with foundational database schema changes.

## 1. High Priority: Core Database Schema & Logic Refactoring
These changes must be applied first as they form the foundation for all subsequent API and UI updates. Modifying the database schema early prevents rewriting UI and API logic twice.

*   **1.1. Refactor Class Model:** Remove the `Section` string property from the `Class` model. Introduce a `NumberOfSections` integer property (e.g., `NumberOfSections = 3` implies sections A, B, and C). This removes the weird behavior where "Class 6 Section A" is treated as an entirely isolated class.
*   **1.2. Refactor Subject Mapping:** Modify the system so that Subjects are linked directly to a *Class* globally, rather than a specific Class-Section combination. Adding a subject to a class will automatically apply it across all its available sections.
*   **1.3. Refactor Teacher Assignments:** Update the `TeacherAssignment` model and logic so an Admin can assign a Teacher to a specific Subject within a specific Class's specific Section (e.g., Teacher X teaches Math for Class 6, Section B).
*   **1.4. Refactor Student Enrollments:** Update the `StudentEnrollment` model so an Admin enrolls a student into a specific Class's specific Section. 
*   **1.5. Update Student Dashboard:** The Student dashboard must be updated to display the class subjects, the specific teacher's name assigned to their section, and their relevant assignments.

## 2. Medium Priority: Admin UI & Dropdown Workflows
Once the core backend schema supports the new class/section structure, the frontend UI must be built to interact with it properly.

*   **2.1. Admin Teacher Assignment UI:** Implement the missing frontend UI for Admins to assign teachers. This must include dynamic dropdown lists for:
    *   Target Class
    *   Target Subject (filtered dynamically by the selected Class)
    *   Target Section (generated dynamically based on the Class's `NumberOfSections` property: A, B, C, etc.)
*   **2.2. Admin Student Enrollment UI:** Implement dynamic dropdown lists for enrolling students, including:
    *   Target Class
    *   Target Section (generated dynamically based on the Class's `NumberOfSections`)
*   **2.3. Student "Update Submission" UI:** Build a dedicated interface allowing students to explicitly update/edit their submissions before the deadline hits, separating this logically from post-deadline resubmissions.

## 3. Low Priority: Settings & User Profiles
These features are independent of the core academic routing and can be implemented last.

*   **3.1. Password Management:** Create backend endpoints and frontend portal UI allowing both Teachers and Students to change their passwords.
*   **3.2. Application Settings Management:** Build backend endpoints and an Admin frontend dashboard panel to manage application-level settings (e.g., `MaxFileSizeMB`, `AllowLateSubmissions`, `DefaultResubmissionAllowed`).

## Implementation Guarantee (Requirement #7)
For every task listed above, proper integration must be ensured across the full stack:
*   **Backend:** EF Core migrations, updated DTOs, Controllers, and Services.
*   **Frontend:** React components, Next.js routing, Form validations, and API integration.
