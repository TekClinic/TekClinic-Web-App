'use client'

import { DataTable, type DataTableProps } from 'mantine-datatable'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useGuaranteeSession } from '@/src/utils/auth'
import { Patient } from '@/src/api/model/patient'
import { ModalsProvider } from '@mantine/modals'
import { ActionIcon, Box, Button, Group, useComputedColorScheme } from '@mantine/core'
import { IconEye, IconTrash } from '@tabler/icons-react'
import { IceCream } from 'tabler-icons-react'
import CreatePatientModal from './create-patient-modal'
import { defaultPageSize, pageSizeOptions } from '@/src/app/patients/const'
import { showDeleteModal } from '@/src/app/patients-2/delete-patient-modal'

const queryClient = new QueryClient()

const PaginationExample = (): React.JSX.Element => {
  const [page, setPage] = useState(1)
  const session = useGuaranteeSession()
  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const computedColorScheme = useComputedColorScheme()

  const {
    data,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['patients', page, pageSize],
    queryFn: async () => {
      const patients = Patient.get({
        skip: pageSize * (page - 1),
        limit: pageSize
      }, session)
      return await patients
    }
  })

  const columns: DataTableProps<Patient>['columns'] = [
    {
      accessor: 'id',
      width: 100
    },
    {
      accessor: 'name',
      width: 100
    },
    {
      accessor: 'active',
      width: 100,
      render: (patient) => patient.active ? 'Active' : 'Inactive'
    },
    {
      accessor: 'age',
      width: 100
    },
    {
      accessor: 'personal_id',
      width: 100,
      render: (patient) => `${patient.personal_id.id} (${patient.personal_id.type})`
    },
    {
      accessor: 'gender',
      width: 100
    },
    {
      accessor: 'phone_number',
      width: 100,
      render: (patient) => patient.phone_number ?? 'N/A'
    },
    {
      accessor: 'languages',
      width: 100,
      render: (patient) => patient.languages.join(', ')
    },
    {
      accessor: 'birth_date',
      width: 100,
      render: (patient) => dayjs(patient.birth_date).format('YYYY-MM-DD')
    },
    {
      accessor: 'emergency_contacts',
      width: 100,
      render: (patient) => patient.emergency_contacts.map((contact) => `${contact.name} (${contact.phone})`).join(', ')
    },
    {
      accessor: 'referred_by',
      width: 100,
      render: (patient) => patient.referred_by ?? ''
    },
    {
      accessor: 'special_note',
      width: 100,
      render: (patient) => patient.special_note ?? ''
    },
    {
      accessor: 'actions',
      title: <Box mr={6}>Row actions</Box>,
      textAlign: 'right',
      render: (patient) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <ActionIcon
            size="sm"
            variant="subtle"
            color="green"
            onClick={() => { console.log('Viewing patient: ', patient) }}
          >
            <IconEye size={23}/>
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => { showDeleteModal(patient, session, refetch, computedColorScheme, data?.count, pageSize, setPage) }}
          >
            <IconTrash size={23}/>
          </ActionIcon>
        </Group>
      )
    }
  ]

  return (

    <Box>
      <Button onClick={() => {
        setCreateModalOpened(true)
      }} size="sm" m="la">Add Patient</Button>
      <CreatePatientModal opened={createModalOpened} onClose={() => {
        setCreateModalOpened(false)
      }} refetch={refetch} setModalOpened={setCreateModalOpened} session={session}/>
      <DataTable
        height={300}
        withTableBorder
        columns={columns}
        fetching={isFetching}
        records={data?.items}
        page={page}
        onPageChange={setPage}
        totalRecords={data?.count}
        recordsPerPage={pageSize}
        noRecordsText=""
        noRecordsIcon={<IceCream size={0}/>}
        recordsPerPageLabel='Patients per page'
        recordsPerPageOptions={pageSizeOptions}
        onRecordsPerPageChange=
          {(pageSize) => {
            setPageSize(pageSize)
            setPage(1)
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
