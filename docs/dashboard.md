### Dashboard Page Documentation

## Overview

The **Dashboard Page** is a React client component in Next.js that summarizes today's tasks and appointments. It uses the **tasks** and **appointments** microservices APIs for data.

This page lives inside the dashboard client UI.

---

## Important Snippets

### 1. Task Columns Definition

```tsx
function getTaskColumns() {
  return [
    { title: '#', accessor: 'id' },
    { title: 'Title', accessor: 'title' },
    { title: 'Expertise', accessor: 'expertise' },
    { title: 'Patient', accessor: 'patient_id' }
  ]
}
```

### 2.  Appointment Columns Definition

```tsx
function getAppointmentsColumns() {
  return [
    { title: '#', accessor: 'id' },
    {
      title: 'Patient',
      accessor: 'patient_id',
      render: (row) => row.getPatientName() ?? 'Unknown'
    },
    {
      title: 'Doctor',
      accessor: 'doctor_id',
      render: (row) => row.getDoctorName() ?? 'Unknown'
    },
    {
      title: 'Time',
      accessor: 'time_range',
      render: (row) =>
        `${format(row.start_time, 'HH:mm')} - ${format(row.end_time, 'HH:mm')}`
    }
  ]
}
```

### 3. Fetching and Filtering Today's Tasks

```tsx
queryFn: async () => {
  const result = await Task.get({ skip: pageSize * (page - 1) }, session)
  const todayISO = new Date().toISOString().slice(0, 10)
  const filteredTasks = result.items.filter(task => {
    const taskDate = new Date(task.created_at).toISOString().slice(0, 10)
    return taskDate === todayISO
  })
  return { items: filteredTasks, count: filteredTasks.length }
}
```

### 4. Fetching and Filtering Today's Appointments

```tsx
queryFn: async () => {
  const result = await Appointment.get({ skip: pageSize * (page - 1) }, session)
  const todayISO = new Date().toISOString().slice(0, 10)
  const filteredApps = result.items.filter(app => {
    const appDate = new Date(app.start_time).toISOString().slice(0, 10)
    return appDate === todayISO
  })
  return { items: filteredApps, count: filteredApps.length }
}
```

