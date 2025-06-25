# Tasks Page – Web Application Documentation

The **Tasks** page is the frontend interface for managing clinical tasks linked to patients. It integrates with the Tasks microservice and supports full CRUD operations. Users can view tasks in either a classic **table view** or a dynamic **Kanban view**, and all task operations involve fetching real-time patient data.

---

## Overview

- **View Modes**:
  - **Table View**: Structured data grid with pagination
  - **Kanban View**: Visual board for sorting tasks by patient or expertise

- **Core Features**:
  - Create, edit, view, and delete tasks
  - Dynamic patient selection with real-time search
  - Display resolved patient names (from `patient_id`)
  - Group tasks by `patient_id` or `expertise` in Kanban
  - Visual status indicators (e.g., task complete)

---
### Create Task: `CreateTaskForm.tsx`

**Form Fields:**
| Field         | Required  | Notes                                                                  |
|---------------|-----------|------------------------------------------------------------------------|
| `title`       | yes       | Title of the task                                                      |
| `description` | no        | Optional task description                                              |
| `expertise`   | no        | Optional area of expertise (`Select`)                                  |
| `patient_id`  | yes       | Dynamically searched and validated (`Select`)                          |
| `complete`    | no        | Boolean checkbox to mark task as complete                              |

**UX Features:**
- Uses `react-query` to fetch patient options on search
- `toast.promise` for submission feedback
- Field-level validation (e.g., patient must be selected)
- Expertise list is hardcoded for now (TODO: fetch from API)

**API Call:**
```ts
Task.create({ ...formValues, patient_id: parseInt(patient_id) }, session)

---

## Main Component: `TasksPage.tsx`


### View Mode Toggle

```ts
const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
