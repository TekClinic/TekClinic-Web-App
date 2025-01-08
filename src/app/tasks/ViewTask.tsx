// src/app/tasks/ViewTask.tsx
'use client'

import React from 'react'
import { type MantineColorScheme, Text, Box, Stack } from '@mantine/core'
import { type Session } from 'next-auth'

interface TaskInMemory {
  id: number
  name: string
  doctor: string
  patient: string
}

interface ViewTaskProps {
  computedColorScheme: MantineColorScheme
  task: TaskInMemory
  session: Session
}

/**
 * A simple read-only view of the Task fields, 
 * similar to "ViewPatient" but no advanced logic.
 */
export default function ViewTask ({
  computedColorScheme,
  task
}: ViewTaskProps): JSX.Element {
  // If you needed to load more data (like in "ViewPatientAppointments"),
  // you could do so with a useEffect & a "Task.load()" call. 
  // For now, let's keep it simple.
  
  return (
    <Box>
      <Stack>
        <Text><strong>Task ID:</strong> {task.id}</Text>
        <Text><strong>Name:</strong> {task.name}</Text>
        <Text><strong>Doctor:</strong> {task.doctor}</Text>
        <Text><strong>Patient:</strong> {task.patient}</Text>
      </Stack>
    </Box>
  )
}
