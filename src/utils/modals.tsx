import { modals } from '@mantine/modals'
import { type Session } from 'next-auth'
import { toast } from 'react-toastify'
import { Text } from '@mantine/core'
import React from 'react'
import { getToastOptions } from '@/src/utils/toast'
import { errorHandler } from '@/src/utils/error'
import { type DeleteModalProps } from '@/src/components/CustomTable'

interface Deletable {
  delete: (session: Session) => Promise<void>
}

export const buildDeleteModal = <T extends Deletable> (
  dataName: string,
  identifierProvider: (item: T) => string
) => ({
    item,
    session,
    computedColorScheme,
    onSuccess
  }: DeleteModalProps<T>): void => {
    const itemIdentifier = identifierProvider(item)
    modals.openConfirmModal({
      title: `Delete ${dataName} ${itemIdentifier}`,
      centered: true,
      children: (
      <Text size="sm">
        Are you sure you want to delete {itemIdentifier}? This action is destructive and you will have
        to contact support to restore it.
      </Text>
      ),
      labels: {
        confirm: `Delete ${dataName}`,
        cancel: "No, don't delete it"
      },
      confirmProps: { color: 'red' },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onConfirm: async () => {
        const result = await errorHandler(async () => {
          await toast.promise(item.delete(session),
            {
              pending: `Deleting ${dataName} ${itemIdentifier}...`,
              success: `${itemIdentifier} was deleted successfully.`,
              error: `Error deleting ${dataName} ${itemIdentifier}...`
            }, getToastOptions(computedColorScheme))
        }, computedColorScheme)

        if (result instanceof Error) {
          return
        }
        await onSuccess()
      }
    })
  }
