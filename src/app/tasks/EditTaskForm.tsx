// src/app/tasks/EditTaskForm.tsx
'use client'

import React from 'react'
import { Button, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { type EditModalProps } from '@/src/components/CustomTable'

/**
 * The Task type you use in your code.
 * Adjust if you have more fields.
 */
interface TaskInMemory {
  id: number
  name: string
  doctor: string
  patient: string
}

/**
 * We'll adapt the same pattern as EditPatientForm:
 * 
 * - "item" is the existing Task we want to edit.
 * - onSuccess() is called once the update is done.
 */
type EditTaskFormProps = EditModalProps<TaskInMemory>

export default function EditTaskForm (
  {
    session,
    computedColorScheme,
    onSuccess,
    item: initialTask
  }: EditTaskFormProps
): JSX.Element {
  /**
   * Initialize the form with the existing task's fields.
   */
  const form = useForm({
    initialValues: {
      name: initialTask.name,
      doctor: initialTask.doctor,
      patient: initialTask.patient
    },
    validate: {
      // Optional: add your own validation rules here
      // e.g. name: value => (value.length < 3 ? 'Name too short' : null),
    }
  })

  async function handleSubmit(values: typeof form.values): Promise<void> {
    // If you had a real microservice, you might do:
    //   initialTask.name = values.name
    //   initialTask.doctor = values.doctor
    //   initialTask.patient = values.patient
    //   await initialTask.update(session)

    // In an in-memory approach, just mutate local state in TasksPage:
    // but you don't have direct access to that here. 
    // Typically, you'd do something like "update the item" and let the parent re-render
    // For a simple approach, we can do:
    initialTask.name = values.name
    initialTask.doctor = values.doctor
    initialTask.patient = values.patient

    // Then call onSuccess() to tell the table we are done.
    await onSuccess()
  }

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        // We wrap in a Promise so that if we add async logic, it's easy.
        void handleSubmit(values)
      })}
    >
      <TextInput
        label="Task Name"
        placeholder="e.g. Daily Checkup"
        withAsterisk
        {...form.getInputProps('name')}
      />

      <TextInput
        label="Doctor"
        placeholder="e.g. Dr. Alice"
        withAsterisk
        {...form.getInputProps('doctor')}
      />

      <TextInput
        label="Patient"
        placeholder="e.g. Bob the Builder"
        withAsterisk
        {...form.getInputProps('patient')}
      />

      <Button type="submit" mt="md">
        Update
      </Button>
    </form>
  )
}
