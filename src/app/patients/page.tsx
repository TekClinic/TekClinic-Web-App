'use client'

import classes from './styles.module.css'

import { DataTable, useDataTableColumns } from 'mantine-datatable'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useGuaranteeSession } from '@/src/utils/auth'
import { Patient } from '@/src/api/model/patient'
import { ModalsProvider } from '@mantine/modals'
import { ActionIcon, Badge, Box, Button, Flex, Group, useComputedColorScheme } from '@mantine/core'
import {
  IconArrowAutofitWidth,
  IconColumnRemove,
  IconColumns3,
  IconMoodSad,
  IconTrash
} from '@tabler/icons-react'
import CreatePatientModal from './create-patient-modal'
import { defaultPageSize, pageSizeOptions, storeColumnKey } from '@/src/app/patients/const'
import { showDeleteModal } from '@/src/app/patients/delete-patient-modal'
import { handleUIError } from '@/src/utils/error'
import { useContextMenu } from 'mantine-contextmenu'

const queryClient = new QueryClient()

const PaginationExample = (): React.JSX.Element => {
  const [page, setPage] = useState(1)
  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const session = useGuaranteeSession()
  const computedColorScheme = useComputedColorScheme()
  const { showContextMenu } = useContextMenu()

  const {
    data,
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['patients', page, pageSize],
    queryFn: async () => {
      return await Patient.get({
        skip: pageSize * (page - 1),
        limit: pageSize
      }, session)
    }
  })

  useEffect(() => {
    if (error != null) {
      handleUIError(error, computedColorScheme, () => {
        void refetch()
      })
    }
  }, [computedColorScheme, error, refetch])

  const {
    effectiveColumns, resetColumnsOrder, resetColumnsToggle, resetColumnsWidth
  } = useDataTableColumns<Patient>({
    key: storeColumnKey,
    columns: [
      {
        title: '#',
        accessor: 'id',
        toggleable: false,
        draggable: false,
        resizable: false
      },
      {
        accessor: 'name'
      },
      {
        accessor: 'active',
        render: (patient) => patient.active ? 'Active' : 'Inactive'
      },
      {
        accessor: 'age'
      },
      {
        accessor: 'personal_id',
        render: (patient) => `${patient.personal_id.id} (${patient.personal_id.type})`
      },
      {
        accessor: 'gender',
        render: (patient) => {
          let color = 'gray'
          if (patient.gender === 'male') {
            color = 'blue'
          } else if (patient.gender === 'female') {
            color = 'pink'
          }
          return <Badge color={color}>{patient.gender}</Badge>
        }
      },
      {
        accessor: 'phone_number'
      },
      {
        accessor: 'languages',
        render: (patient) => (
          <Flex style={{ margin: '2px' }} direction='column' gap='10px'>
            {patient.languages.map((language) => (
                <Badge key={language} variant="gradient" gradient={{
                  from: 'blue',
                  to: 'cyan',
                  deg: 90
                }}>
                  {language}
                </Badge>
            )
            )}
          </Flex>
        )
      },
      {
        accessor: 'birth_date',
        render: (patient) => dayjs(patient.birth_date).format('YYYY-MM-DD')
      },
      {
        accessor: 'emergency_contacts',
        render: (patient) => (
          <Flex style={{ margin: '2px' }} direction='column' gap='10px'>
            {patient.emergency_contacts.map((contact, index) => (
                <Badge key={index} variant="gradient" gradient={{
                  from: '#DBDBDB',
                  to: '#CCCCCC',
                  deg: 90
                }} style={{ color: 'black' }}>
                  {contact.name} ({contact.closeness}) {contact.phone}
                </Badge>
            )
            )}
          </Flex>
        )
      },
      {
        accessor: 'referred_by'
      },
      {
        accessor: 'special_note'
      },
      {
        title: '',
        accessor: 'actions',
        textAlign: 'right',
        render: (patient) => (
          <Group gap={4} justify="right" wrap="nowrap">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={() => {
                showDeleteModal(patient, session, refetch, computedColorScheme, data?.count, pageSize, setPage)
              }}
            >
              <IconTrash size={23}/>
            </ActionIcon>
          </Group>
        ),
        toggleable: false,
        draggable: false,
        resizable: false
      }
    ]
  })

  return (
    <Box>
      <Box style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button onClick={() => {
          setCreateModalOpened(true)
        }} size="sm" m="la">Add Patient</Button>
      </Box>
      <CreatePatientModal opened={createModalOpened} onClose={() => {
        setCreateModalOpened(false)
      }} refetch={refetch} setModalOpened={setCreateModalOpened} session={session}/>
      <DataTable
        striped
        highlightOnHover
        withTableBorder
        pinLastColumn

        storeColumnsKey={storeColumnKey}
        minHeight={180}

        columns={effectiveColumns}
        fetching={isLoading}
        records={data?.items}

        page={page}
        onPageChange={setPage}
        totalRecords={data?.count}
        recordsPerPage={pageSize}
        recordsPerPageLabel='Patients per page'
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
              icon: <IconColumnRemove size={16} />,
              onClick: resetColumnsToggle
            },
            {
              key: 'reset-columns-order',
              icon: <IconColumns3 size={16} />,
              onClick: resetColumnsOrder
            },
            {
              key: 'reset-columns-width',
              icon: <IconArrowAutofitWidth size={16} />,
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
  )
}

const PatientsPage = (): React.JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <PaginationExample/>
    </ModalsProvider>
  </QueryClientProvider>
)

export default PatientsPage
