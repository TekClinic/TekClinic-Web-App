# Doctors Window – Web Application Documentation

The **Doctors** window provides full CRUD (Create, Read, Update, Delete) and view capabilities for managing clinic doctors. This page integrates with the **Doctors Microservice** and includes form validation, modals, and doctor-specific scheduling.

---

## Overview

- **Purpose**: Manage the clinic’s doctors.
- **Core Features**:
  - View doctor list
  - Create a new doctor
  - Edit existing doctor details
  - Delete a doctor
  - View detailed doctor profile including schedule

---

## Components Breakdown

### Main Page Component: `DoctorPage.tsx`

**Core responsibilities:**
- Displays the main `CustomTable` with all doctors.
- Handles modals for Create, Edit, Delete, and View operations.
- Connects to `Doctor.get()` to fetch paginated doctor data.

---

### Create Doctor: `CreateDoctorForm.tsx`

**Purpose**: Form for adding a new doctor.

**Fields:**
| Field          | Required | Validation                          | Notes                                       |
|----------------|----------|-------------------------------------|---------------------------------------------|
| `name`         | yes      | Custom name validator               | Full name of the doctor                     |
| `gender`       | no       | Enum: `unspecified`, `male`, `female` | Default: `unspecified`                    |
| `phone_number` | yes      | Custom phone validator              | Must be a valid phone number                |
| `specialities` | no       | Max `maxSpecialities` (defined in constants) | Tags input with suggestions        |
| `special_note` | no       | Custom validator                    | Optional internal note                      |

**API Call**:  
- `Doctor.create(values, session)`

**UX**:  
- Toast notifications on pending/success/error
- Calls `onSuccess()` and closes modal on success

---

### Edit Doctor: `EditDoctorForm.tsx`

**Purpose**: Update details of an existing doctor.

**Same fields and validations as `CreateDoctorForm`.**  
Initial values are populated from `item` prop.

**API Call**:  
- `initialDoctor.update(session)`

---

### View Doctor Modal

**Content:**
- Avatar based on gender
- Doctor details: name, active status, gender, phone, specialities, special note
- Embedded `AppointmentSchedule` component for viewing associated appointments

---

## Table Columns

| Column         | Render Logic                                          |
|----------------|--------------------------------------------------------|
| `id`           | Plain number                                           |
| `name`         | Text                                                   |
| `active`       | Converts boolean to `'Active'` / `'Inactive'`         |
| `gender`       | Renders color-coded `Badge` (blue/pink/gray)          |
| `phone_number` | Formatted with `PhoneNumber` component if not `null`  |
| `specialities` | Column of gradient `Badge` tags per speciality        |
| `special_note` | Plain text                                             |

---

## API Integration

Uses `Doctor.get()` with pagination:

```ts
queryFn: async () => {
  return await Doctor.get({
    skip: pageSize * (page - 1),
    limit: pageSize
  }, session)
}
