import { type Patient } from '@/src/api/model/patient'
import { modals } from '@mantine/modals'
import { type QueryObserverResult, type RefetchOptions } from '@tanstack/react-query'
import { type Session } from 'next-auth'
import { toast } from 'react-toastify'
import { Text } from '@mantine/core'
import React, { type Dispatch, type SetStateAction } from 'react'
import { getToastOptions } from '@/src/utils/toast'

export const showDeleteModal = (
  patient: Patient,
  session: Session,
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<{
    items: Patient[]
    count: number
  }, Error>>,
  computedColorScheme: string,
  numberOfPatients?: number,
  pageSize?: number,
  setPage?: Dispatch<SetStateAction<number>>
): void => {
  modals.openConfirmModal({
    title: 'Please confirm deletion of patient: ' + patient.name + '\n with id: ' + patient.id,
    centered: true,
    children: (
      <Text size="sm">
        Clicking on Delete will permanently delete the patient.
        Clicking on Cancel will close this dialog and cancel the deletion.
      </Text>
    ),
    labels: {
      confirm: 'Delete',
      cancel: 'Cancel'
    },
    confirmProps: { color: 'red' },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onConfirm: async () => {
      await toast.promise(patient.delete(session),
        {
          pending: `Deleting patient ${patient.name}...`,
          success: `Patient ${patient.name} was deleted succesfully.`,
          error: 'Error deleting patient...'
        }, getToastOptions(computedColorScheme))
      if (numberOfPatients != null && pageSize != null && setPage != null) {
        // calculate the last page after deletion
        const lastPage = Math.max(1, (Math.ceil((numberOfPatients - 1) / pageSize)))
        setPage(lastPage)
      }
      await refetch()
    }
  })
}
