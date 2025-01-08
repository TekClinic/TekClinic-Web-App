// src/app/tasks/createTaskInMemory.ts

import { type Session } from 'next-auth'

// Our extended type, which includes a .delete method:
export interface TaskInMemory {
  id: number
  name: string
  doctor: string
  patient: string

  // The Deletable interface requires:
  delete: (session: Session) => Promise<void>
}

/**
 * A helper function that creates a new in‐memory task object
 * with a .delete() method that does *nothing by default*.
 * We'll rely on "onSuccess" in buildDeleteModal to remove it from the array.
 * But we MUST define .delete() or the code won't compile with buildDeleteModal.
 */
export function createTaskInMemory (
  id: number,
  name: string,
  doctor: string,
  patient: string
): TaskInMemory {
  return {
    id,
    name,
    doctor,
    patient,

    // A dummy .delete() that does nothing except fulfill the interface.
    // does the actual removal from the array in "onSuccess".
    async delete (session) {
      console.log(`(In-memory) .delete() called for ${name}, but actual removal happens in onSuccess.`)
    }
  }
}
