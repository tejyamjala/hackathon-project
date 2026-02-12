# Clinical Task & Patient Management System

## Overview

The Clinical Task & Patient Management System is a comprehensive healthcare dashboard designed to streamline hospital operations, enhance inter-departmental communication, and improve patient care coordination. This application provides a unified interface for healthcare professionals—including doctors, nurses, pharmacists, and lab technicians—to manage patient admissions, track clinical tasks, and visualize hospital analytics in real time.

Built with performance and scalability in mind, the application leverages a modern frontend architecture to deliver a responsive and intuitive user experience tailored to the high-paced environment of clinical settings.

## Key Features

### 1. Patient Administration

* **Patient Dashboard:** Centralized view of all admitted patients with real-time status indicators (Critical, Stable, Active, Discharged).
* **Admission & Management:** Streamlined workflows for admitting new patients and updating patient details, including medical record numbers (MRN), diagnosis, allergies, and bed assignments.
* **Detailed Patient Profiles:** Comprehensive access to individual patient histories, care instructions, and timeline events.

### 2. Clinical Task Management

* **Kanban Workflow:** Interactive Kanban board for managing clinical tasks (e.g., Prescriptions, Lab Tests, Imaging, Procedures) across different states (Todo, In Progress, Completed).
* **Priority Handling:** Visual distinction for task priorities (Stat, Urgent, Routine) to ensure critical care actions are addressed immediately.
* **Task Assignment:** Role-based task delegation to specific departments or personnel.

### 3. Departmental Workspaces

* **Specialized Views:** Dedicated interfaces for key hospital departments:
* **Laboratory:** Track sample collections and test results.
* **Pharmacy:** Manage medication dispensing and prescription orders.
* **Radiology:** Coordinate imaging requests and report generation.


* **Inter-departmental Coordination:** Seamless handover of tasks between departments to reduce bottlenecks.

### 4. Communication & Collaboration

* **Department Chat:** Integrated messaging system allowing secure communication between staff members and departments.
* **Notification System:** Alerts for new tasks, high-priority updates, and status changes.

### 5. Analytics & Reporting

* **Operational Metrics:** Visual analytics dashboards displaying key performance indicators such as patient census, task completion rates, and department throughput.
* **Reports Hub:** Central repository for accessing and managing medical reports and administrative documents.

## Technology Stack

This project relies on a robust modern web development stack:

* **Core Framework:** [React 19](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/) for type-safe development.
* **Build Tool:** [Vite](https://vitejs.dev/) for fast development and optimized production builds.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
* **UI Components:** Built on [Radix UI](https://www.radix-ui.com/) primitives for accessible, unstyled components.
* **State Management:** React Context API for global application state.
* **Data Visualization:** [Recharts](https://recharts.org/) for analytics charts.
* **Form Handling:** [React Hook Form](https://react-hook-form.com/) combined with [Zod](https://zod.dev/) for schema validation.
* **Icons:** [Lucide React](https://lucide.dev/) for consistent iconography.
* **Date Management:** [date-fns](https://date-fns.org/) for date manipulation.

## Installation and Setup

Follow these steps to set up the project locally for development.

### Prerequisites

* Node.js (Version 18 or higher recommended)
* npm or yarn package manager

### Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd hackathon-project/app

```


2. **Install Dependencies**
Navigate to the project directory and install the required packages:
```bash
npm install

```


3. **Start the Development Server**
Launch the local development environment:
```bash
npm run dev

```


The application will typically be accessible at `http://localhost:5173`.
4. **Build for Production**
To create an optimized build for deployment:
```bash
npm run build

```


5. **Linting**
To check for code quality issues:
```bash
npm run lint

```



## Project Structure

The codebase is organized as follows:

* `src/components`: Reusable UI components and feature-specific views (e.g., `DashboardOverview`, `KanbanBoard`, `PatientCard`).
* `src/context`: React Context providers for managing global state (e.g., `AppContext`).
* `src/data`: Mock data and static resources for development.
* `src/hooks`: Custom React hooks (e.g., `use-mobile`).
* `src/lib`: Utility functions and helper classes.
* `src/types`: TypeScript interfaces and type definitions defining the domain models (Patient, ClinicalTask, etc.).
* `src/App.tsx`: The main entry point handling routing and layout composition.

## Usage Guide

### Accessing the System

The application currently uses a mock login system. Select a user role (Doctor, Nurse, Admin, etc.) from the login screen to enter the dashboard.

### Dashboard Navigation

* **Sidebar:** Use the collapsible sidebar to navigate between the Main Overview, Patient Lists, Clinical Tasks, and specific Department views.
* **Header:** Access quick actions like creating a "New Task" or "New Patient" directly from the top navigation bar.

### Managing Tasks

Navigate to the **Clinical Tasks** view to see the Kanban board. Drag and drop cards to update their status or click on a card to view detailed information and add notes.

## Future Enhancements

* **Backend Integration:** Connect to a secure backend API for persistent data storage.
* **Authentication:** Implement secure OAuth or SSO authentication protocols.
* **Mobile Responsiveness:** Further optimization for tablet and mobile devices for rounds.
* **EHR Integration:** Support for HL7/FHIR standards to integrate with existing Electronic Health Record systems.