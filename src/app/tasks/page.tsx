'use client'

import dayjs from 'dayjs'
import React from 'react'
import { Task } from '@/src/api/model/task'
import { Badge, Flex, useComputedColorScheme } from '@mantine/core'
import CustomTable from '@/src/components/CustomTable'
import { buildDeleteModal } from '@/src/utils/modals'
import { modals } from '@mantine/modals'
/*
import CreateTaskForm from './CreateTaskForm'
import EditTaskForm from './EditTaskForm'
import ViewTask from './ViewTask'
*/

function TasksPage (): React.JSX.Element {
  const computedColorScheme = useComputedColorScheme()

  return (
    <CustomTable
      dataName='Task'
      storeColumnKey='task-columns'
      queryOptions={(session, page, pageSize) => ({
        queryKey: ['tasks', page, pageSize],
        queryFn: async () => {
          return await Task.get({
            skip: pageSize * (page - 1),
            limit: pageSize
          }, session)
        }
      })}
      /*
      showDeleteModal={buildDeleteModal('task', (task) => task.name)}
      showCreateModal={({
        session,
        computedColorScheme,
        onSuccess
      }) => {
        // Generate some random modal id
        const modalId = 'create-task-modal'
        modals.open({
          modalId,
          title: 'Task Information',
          children:
            <CreateTaskForm
              session={session}
              computedColorScheme={computedColorScheme}
              onSuccess={async () => {
                modals.close(modalId)
                await onSuccess()
              }}
            />
        })
      }}
      showEditModal={
        ({
          item,
          session,
          computedColorScheme,
          onSuccess
        }) => {
          // Generate some random modal id
          const modalId = 'edit-task-modal'
          modals.open({
            modalId,
            title: 'Edit Task Information',
            children:
              <EditTaskForm
                item={item}
                session={session}
                computedColorScheme={computedColorScheme}
                onSuccess={async () => {
                  modals.close(modalId)
                  await onSuccess()
                }}
              />
          })
        }
      }
      showViewModal={
        ({
          session,
          item: task,
          computedColorScheme
        }) => {
          // Generate some random modal id
          const modalId = 'view-task-modal'
          modals.open({
            modalId,
            title: `Task ${task.name}`,
            centered: true,
            children:
              <ViewTask
                session={session}
                computedColorScheme={computedColorScheme}
                task={task}
              />
          })
        }
      }
      */
      columns={[
        {
          title: '#',
          accessor: 'id',
          toggleable: false,
          draggable: false,
          resizable: false
        },
        {
          title: 'Title',
          accessor: 'title'
        }
      ]}
    />
  )
}

export default TasksPage
