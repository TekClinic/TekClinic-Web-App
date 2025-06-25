# Appointments View

This page is a calendar-based UI for creating, viewing, updating, and deleting appointments. It uses Syncfusion Scheduler, Mantine UI components, and a custom appointment form.

---

## Calendar Features

- **Views:** `Day`, `Week`, `Month`
- **Time Range:** `08:00` – `20:00`
- **Supports grouping by Doctor**
- **Quick create/edit modals**
- **Paginated doctor resources**
- **Custom appointment color based on doctor**
- **Real-time data fetch and error handling using React Query**

---

## Form Component

### File: `AppointmentForm.tsx`

The appointment form is used both for creating and editing appointments. It supports:

- Selecting a **Doctor** and **Patient**
- Setting **Start Time** and **End Time**
- Marking:
  - `approved_by_patient` (boolean)
  - `visited` (boolean)
- Supports **quick mode** (embedded directly in the calendar)

### Form Behavior

- Disables `approved_by_patient` and `visited` unless a patient is selected
- Automatically resets approval status when patient changes
- Prevents appointments from spanning multiple days
- Populates doctor/patient selects with async fetched options

```tsx
const form = useForm({
  initialValues: {
    doctor_id: null,
    patient_id: null,
    start_time,
    end_time,
    approved_by_patient: false,
    visited: false
  },
  validate: {
    doctor_id: (value) => value ? null : 'Doctor is required',
    end_time: (value, { start_time }) => value < start_time ? 'End time must be after start time' : null
  }
})
