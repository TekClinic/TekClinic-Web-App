// src/app/tasks/CreateTaskForm.tsx
'use client'

import React, { useState } from 'react'
import { Button, TextInput } from '@mantine/core'


interface FormData {
  name: string
  doctor: string
  patient: string
}

interface CreateTaskFormProps {
  onFinish: (data: FormData) => void
}

export default function CreateTaskForm ({ onFinish }: CreateTaskFormProps): JSX.Element {
  const [name, setName] = useState('')
  const [doctor, setDoctor] = useState('')
  const [patient, setPatient] = useState('')

  function handleSubmit (e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    onFinish({
      name,
      doctor,
      patient
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 1) Task Name */}
      <TextInput
        label="Task Name"
        placeholder="e.g. Schedule a check-up"
        value={name}
        onChange={(e) => { setName(e.currentTarget.value) }}
        required
      />

      {/* 2) Doctor */}
      <TextInput
        label="Doctor"
        placeholder="e.g. Dr. Alice"
        value={doctor}
        onChange={(e) => { setDoctor(e.currentTarget.value) }}
        required
      />

      {/* 3) Patient */}
      <TextInput
        label="Patient"
        placeholder="e.g. Bob"
        value={patient}
        onChange={(e) => { setPatient(e.currentTarget.value) }}
        required
      />

      <Button type="submit" mt="md">
        Finish
      </Button>
    </form>
  )
}
