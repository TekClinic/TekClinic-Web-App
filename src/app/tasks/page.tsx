// src/app/tasks/page.tsx
'use client'

import React, { useState } from 'react'
import { modals } from '@mantine/modals'
import CustomTable from '@/src/components/CustomTable'
import CreateTaskForm from './CreateTaskForm'

interface TaskInMemory {
  id: number
  name: string
  doctor: string
  patient: string
}

export default function TasksPage (): JSX.Element {
  const [tasks, setTasks] = useState<TaskInMemory[]>([])
  const [nextId, setNextId] = useState(1)

  function handleShowCreateModal ({
    session,
    computedColorScheme,
    onSuccess
  }: {
    session: any
    computedColorScheme: any
    onSuccess: () => Promise<void>
  }): void {
    const modalId = 'create-task-modal'
    modals.open({
      modalId,
      title: 'Add Task',
      children: (
        <CreateTaskForm
          // Now CreateTaskForm returns { name, doctor, patient }
          onFinish={(formData) => {
            // Add new task to local state
            setTasks((prev) => [
              ...prev,
              {
                id: nextId,
                ...formData // formData has { name, doctor, patient }
              }
            ])
            setNextId((prev) => prev + 1)

            modals.close(modalId)
            void onSuccess()
          }}
        />
      )
    })
  }

  return (
    <CustomTable<TaskInMemory>
      dataName="Task"
      storeColumnKey="task-columns"

      // Include tasks in the queryKey so React Query re-runs each time tasks changes
      queryOptions={(session, page, pageSize) => ({
        queryKey: ['tasks', tasks, page, pageSize],
        queryFn: async () => ({
          items: tasks,
          count: tasks.length
        })
      })}

      /*
        We define 4 columns now:
        # (id), Name (name), Doctor (doctor), Patient (patient).
      */
      columns={[
        {
          title: '#',
          accessor: 'id'
        },
        {
          title: 'Name',
          accessor: 'name'
        },
        {
          title: 'Doctor',
          accessor: 'doctor'
        },
        {
          title: 'Patient',
          accessor: 'patient'
        }
      ]}

      showCreateModal={handleShowCreateModal}
    />
  )
}
