# Patients Window – Web Application Documentation

The **Patients** window allows full management of clinic patients including creating, editing, viewing, and deleting records. It integrates with the **Patients Microservice** and includes advanced form validation, emergency contact support, and linked appointments/tasks.

---

## Overview

- **Purpose**: Manage patient records in the clinic.
- **Core Features**:
  - View patient list with all key fields
  - Create new patient profiles
  - Edit existing patient data
  - Delete patients
  - View patient details with appointments and tasks

---

## Components Breakdown

### Main Page Component: `PatientsPage.tsx`

**Responsibilities:**
- Uses `CustomTable` to list patients with pagination and sorting
- Supports modals for Create, Edit, Delete, and View
- Fetches data via `Patient.get()` with pagination support

---

### Create Patient: `CreatePatientForm.tsx`

**Form Fields:**
| Field               | Required       | Notes                                                                 |
|---------------------|----------------|-----------------------------------------------------------------------|
| `name`              | yes            | Full name, validated                                                  |
| `personal_id.id`    | yes            | ID number with custom validator based on selected type                |
| `personal_id.type`  | yes            | Choose from Israeli ID, Passport, Driver's Licence, or "Other"        |
| `personal_id.other` | yes if "Other" | Required if `type` is "Other"                                         |
| `gender`            | no             | `unspecified` by default                                              |
| `phone_number`      | no             | Validated phone format                                                |
| `languages`         | no             | Multi-select, max limit defined                                       |
| `birth_date`        | yes            | Date input, validated                                                 |
| `referred_by`       | no             | Optional string                                                       |
| `special_note`      | no             | Optional string with validation                                       |
| `emergency_contacts`| no             | Repeating list with name, closeness, phone                            |

**UX Features:**
- Dynamic fields (show/hide ID type input)
- Repeatable emergency contact groups
- Toast notifications and error handling
- Triggers `onSuccess()` and closes modal

**API Call:**
- `Patient.create(data, session)`

---

### Edit Patient: `EditPatientForm.tsx`

Same field structure and validation as Create form, with:
- Prefilled data from `initialPatient`
- Conditional logic to handle "Other" ID types
- API call:
  ```ts
  await initialPatient.update(session)
