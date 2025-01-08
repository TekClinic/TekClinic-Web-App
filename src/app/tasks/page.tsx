// src/app/tasks/page.tsx
'use client'

import React, { useState } from 'react'
import { modals } from '@mantine/modals'
import CustomTable from '@/src/components/CustomTable'
import CreateTaskForm from './CreateTaskForm'
import EditTaskForm from './EditTaskForm'
import ViewTask from './ViewTask'

interface TaskInMemory {
  id: number
  name: string
  doctor: string
  patient: string
}

export default function TasksPage(): JSX.Element {
  const [tasks, setTasks] = useState<TaskInMemory[]>([])
  const [nextId, setNextId] = useState(1)

  // "Add Task" callback:
  function handleShowCreateModal ({ session, computedColorScheme, onSuccess }: any): void {
    const modalId = 'create-task-modal'
    modals.open({
      modalId,
      title: 'Add Task',
      children: (
        <CreateTaskForm
          onFinish={(data) => {
            setTasks(prev => [...prev, { id: nextId, ...data }])
            setNextId(prev => prev + 1)
            modals.close(modalId)
            void onSuccess()
          }}
        />
      )
    })
  }

  // "Edit Task" callback:
  function handleShowEditModal ({ item, session, computedColorScheme, onSuccess }: any): void {
    const modalId = 'edit-task-modal'
    modals.open({
      modalId,
      title: 'Edit Task',
      children: (
        <EditTaskForm
          session={session}
          computedColorScheme={computedColorScheme}
          item={item}  // the existing task object
          onSuccess={async () => {
            modals.close(modalId)
            await onSuccess()  // triggers a refetch in the table
          }}
        />
      )
    })
  }

  // "View Task" callback:
  function handleShowViewModal ({ item, session, computedColorScheme, onSuccess }: any): void {
    const modalId = 'view-task-modal'
    modals.open({
      modalId,
      title: 'Task Information',
      children: (
        <ViewTask
          session={session}
          computedColorScheme={computedColorScheme}
          task={item}  // the existing task object
        />
      )
    })
  }

  return (
    <CustomTable<TaskInMemory>
      dataName="Task"
      storeColumnKey="task-columns"

      queryOptions={(session, page, pageSize) => ({
        queryKey: ['tasks', tasks, page, pageSize],
        queryFn: async () => ({
          items: tasks,
          count: tasks.length
        })
      })}

      // Pass the callbacks so the icons appear:
      showCreateModal={handleShowCreateModal}
      showEditModal={handleShowEditModal}
      showViewModal={handleShowViewModal}
      showDeleteModal={() => {}}
      columns={[
        { title: '#', accessor: 'id' },
        { title: 'Name', accessor: 'name' },
        { title: 'Doctor', accessor: 'doctor' },
        { title: 'Patient', accessor: 'patient' }
      ]}
    />
  )
}
