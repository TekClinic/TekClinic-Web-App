'use client'

import React, { useState } from 'react'
import { Button, TextInput } from '@mantine/core'

interface CreateTaskFormProps {
  onFinish: (title: string) => void
}

export default function CreateTaskForm ({ onFinish }: CreateTaskFormProps): JSX.Element {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    onFinish(title) // No issue here as it's within a block
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Task Name"
        placeholder="consise and informative description"
        value={title}
        onChange={(e) => {
          setTitle(e.currentTarget.value) // Explicit block to satisfy the lint rule
        }}
        required
      />
      <Button type="submit" mt="md">
        Finish
      </Button>
    </form>
  )
}
