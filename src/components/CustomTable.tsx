'use client'

import classes from './CustomTable.module.css'

import { DataTable, type DataTableColumn, useDataTableColumns } from 'mantine-datatable'
import React, { useEffect, useState } from 'react'
import { QueryClient, type QueryKey, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { useGuaranteeSession } from '@/src/utils/auth'
import { ModalsProvider } from '@mantine/modals'
import { ActionIcon, Box, Button, Group, type MantineColorScheme, useComputedColorScheme } from '@mantine/core'
import { IconArrowAutofitWidth, IconColumnRemove, IconColumns3, IconMoodSad, IconTrash } from '@tabler/icons-react'
import { handleUIError } from '@/src/utils/error'
import { useContextMenu } from 'mantine-contextmenu'
import { type Session } from 'next-auth'
import { type PaginationResult } from '@/src/api/common'

const defaultPageSize = 5
const pageSizeOptions = [2, 5, 10, 20, 50]

const queryClient = new QueryClient()

interface BaseModalProps {
  session: Session
  computedColorScheme: MantineColorScheme
  onSuccess: () => Promise<void>
}

export interface DeleteModalProps<DataType> extends BaseModalProps {
  item: DataType
}

export type CreateModalProps = BaseModalProps

interface CustomTableProps<DataType, TData extends PaginationResult<DataType> = PaginationResult<DataType>, TQueryKey extends QueryKey = QueryKey> {
  dataName: string
  storeColumnKey: string
  queryOptions: (session: Session, page: number, pageSize: number) => UseQueryOptions<TData, Error, TData, TQueryKey>
  columns: Array<DataTableColumn<DataType>>
  showDeleteModal?: (props: DeleteModalProps<DataType>) => void
  showCreateModal?: (props: CreateModalProps) => void
}

const CustomTable = <DataType, TData extends PaginationResult<DataType> = PaginationResult<DataType>, TQueryKey extends QueryKey = QueryKey> ({
  dataName,
  storeColumnKey,
  queryOptions,
  columns,
  showDeleteModal,
  showCreateModal
}: CustomTableProps<DataType, TData, TQueryKey>): React.ReactElement<CustomTableProps<DataType, TData, TQueryKey>> => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const session = useGuaranteeSession()
  const computedColorScheme = useComputedColorScheme()
  const { showContextMenu } = useContextMenu()
  const addActionColumn = showDeleteModal != null

  const {
    data,
    isLoading,
    refetch,
    error
  } = useQuery<TData, Error, TData, TQueryKey>(queryOptions(session, page, pageSize), queryClient)

  useEffect(() => {
    if (error != null) {
      handleUIError(error, computedColorScheme, () => {
        void refetch()
      })
    }
  }, [computedColorScheme, error, refetch])

  const {
    effectiveColumns,
    resetColumnsOrder,
    resetColumnsToggle,
    resetColumnsWidth
  } = useDataTableColumns<DataType>({
    key: storeColumnKey,
    columns: addActionColumn
      ? [...columns,
          {
            title: '',
            accessor: 'actions',
            textAlign: 'right',
            render: (item) => (
            <Group gap={4} justify="right" wrap="nowrap">
              {(showDeleteModal != null) &&
                  <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => {
                        showDeleteModal({
                          item,
                          session,
                          computedColorScheme,
                          onSuccess: async () => {
                            if (data == null) {
                              // unreachable condition. for type checking only
                              return
                            }

                            // calculate the last page after deletion
                            const lastPage = Math.max(1, (Math.ceil((data.count - 1) / pageSize)))
                            setPage(lastPage)
                            await refetch()
                          }
                        })
                      }}
                  >
                      <IconTrash size={23}/>
                  </ActionIcon>
              }
            </Group>
            ),
            toggleable: false,
            draggable: false,
            resizable: false
          }
        ]
      : columns
  })

  return (
    <ModalsProvider>
      <Box>
        {(showCreateModal != null) &&
            <Box style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '10px'
            }}>
                <Button onClick={() => {
                  showCreateModal({
                    session,
                    computedColorScheme,
                    onSuccess: async () => {
                      await refetch()
                    }
                  })
                }} size="sm" m="la">Add {dataName}</Button>
            </Box>
        }
        <DataTable
          striped
          highlightOnHover
          withTableBorder
          pinLastColumn={addActionColumn}

          storeColumnsKey={storeColumnKey}
          minHeight={180}

          columns={effectiveColumns}
          fetching={isLoading}
          records={data?.items}

          page={page}
          onPageChange={setPage}
          totalRecords={data?.count}
          recordsPerPage={pageSize}
          recordsPerPageLabel={`${dataName}s per page`}
          recordsPerPageOptions={pageSizeOptions}
          onRecordsPerPageChange=
            {(pageSize) => {
              setPageSize(pageSize)
              setPage(1)
            }}

          noRecordsIcon={
            <Box p={4} mb={4} className={classes.noRecordsBox}>
              <IconMoodSad size={36} strokeWidth={1.5}/>
            </Box>
          }
          noRecordsText="No records found"

          onRowContextMenu={({ event }) => {
            showContextMenu([
              {
                key: 'reset-toggled-columns',
                icon: <IconColumnRemove size={16}/>,
                onClick: resetColumnsToggle
              },
              {
                key: 'reset-columns-order',
                icon: <IconColumns3 size={16}/>,
                onClick: resetColumnsOrder
              },
              {
                key: 'reset-columns-width',
                icon: <IconArrowAutofitWidth size={16}/>,
                onClick: resetColumnsWidth
              }
            ])(event)
          }}
          defaultColumnProps={{
            toggleable: true,
            draggable: true,
            resizable: true
          }}
        />
      </Box>
    </ModalsProvider>
  )
}

export default CustomTable
