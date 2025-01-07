'use client'

import React, { useState } from 'react'
import { modals } from '@mantine/modals'
import CustomTable from '@/src/components/CustomTable'
import CreateTaskForm from './CreateTaskForm'

interface TaskInMemory {
  id: number
  title: string
}

export default function TasksPage (): JSX.Element {
  const [tasks, setTasks] = useState<TaskInMemory[]>([])
  const [nextId, setNextId] = useState(1)

  const handleShowCreateModal = ({
    session,
    computedColorScheme,
    onSuccess
  }: {
    session: any
    computedColorScheme: any
    onSuccess: () => Promise<void>
  }): void => {
    const modalId = 'create-task-modal'
    modals.open({
      modalId,
      title: 'Add Task',
      children: (
        <CreateTaskForm
          onFinish={(title) => {
            setTasks((prev) => [
              ...prev,
              { id: nextId, title }
            ])
            setNextId((prev) => prev + 1)

            modals.close(modalId)

            // We’re calling a function returning a Promise<void>, so we can do:
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
      queryOptions={(session, page, pageSize) => ({
        queryKey: ['tasks', page, pageSize],
        queryFn: async () => {
          return {
            items: tasks,
            count: tasks.length
          }
        }
      })}
      columns={[
        {
          title: '#',
          accessor: 'id'
        },
        {
          title: 'Title',
          accessor: 'title'
        }
      ]}
      showCreateModal={handleShowCreateModal}
    />
  )
}
