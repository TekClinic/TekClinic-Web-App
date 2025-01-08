// src/app/tasks/page.tsx
'use client'

import React, { useState } from 'react'
import { modals } from '@mantine/modals'
import CustomTable from '@/src/components/CustomTable'
import CreateTaskForm from './CreateTaskForm'
import EditTaskForm from './EditTaskForm'
import ViewTask from './ViewTask'
import { buildDeleteModal } from '@/src/utils/modals'
import { createTaskInMemory, type TaskInMemory } from './createTaskInMemory'

export default function TasksPage (): JSX.Element {
  const [tasks, setTasks] = useState<TaskInMemory[]>([])
  const [nextId, setNextId] = useState(1)

  // "Add Task"
  function handleShowCreateModal ({
    session,
    computedColorScheme,
    onSuccess
  }: any): void {
    const modalId = 'create-task-modal'
    modals.open({
      modalId,
      title: 'Add Task',
      children: (
        <CreateTaskForm
          onFinish={(formData) => {
            const newTask = createTaskInMemory(nextId, formData.name, formData.doctor, formData.patient)
            setTasks(prev => [...prev, newTask])
            setNextId(prev => prev + 1)

            modals.close(modalId)
            void onSuccess()
          }}
        />
      )
    })
  }

  // "Edit Task"
  function handleShowEditModal ({
    item,
    session,
    computedColorScheme,
    onSuccess
  }: any): void {
    const modalId = 'edit-task-modal'
    modals.open({
      modalId,
      title: 'Edit Task',
      children: (
        <EditTaskForm
          item={item}
          session={session}
          computedColorScheme={computedColorScheme}
          onSuccess={async () => {
            modals.close(modalId)
            await onSuccess()
          }}
        />
      )
    })
  }

  // "View Task"
  function handleShowViewModal ({
    item,
    session,
    computedColorScheme,
    onSuccess
  }: any): void {
    const modalId = 'view-task-modal'
    modals.open({
      modalId,
      title: 'Task Information',
      children: (
        <ViewTask
          task={item}
          session={session}
          computedColorScheme={computedColorScheme}
        />
      )
    })
  }

  const handleShowDeleteModal = buildDeleteModal<TaskInMemory>(
    'task',
    (task) => task.name
  )

  function handleDeleteModal ({
    item,
    session,
    computedColorScheme,
    onSuccess
  }: {
    item: TaskInMemory
    session: any
    computedColorScheme: any
    onSuccess: () => Promise<void>
  }): void {
    handleShowDeleteModal({
      item,
      session,
      computedColorScheme,
      onSuccess: async () => {
        setTasks(prev => prev.filter(t => t.id !== item.id))
        await onSuccess()
      }
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
      showCreateModal={handleShowCreateModal}
      showEditModal={handleShowEditModal}
      showViewModal={handleShowViewModal}
      showDeleteModal={handleDeleteModal}
      columns={[
        { title: '#', accessor: 'id' },
        { title: 'Name', accessor: 'name' },
        { title: 'Doctor', accessor: 'doctor' },
        { title: 'Patient', accessor: 'patient' }
      ]}
    />
  )
}
