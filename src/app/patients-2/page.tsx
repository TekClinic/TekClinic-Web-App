'use client'

import { DataTable, type DataTableProps } from 'mantine-datatable'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useGuaranteeSession } from '@/src/utils/auth'
import { Patient } from '@/src/api/model/patient'
import { modals, ModalsProvider } from '@mantine/modals'
import { ActionIcon, Box, Button, Group, Text } from '@mantine/core'
import { IconEye, IconTrash } from '@tabler/icons-react'
import { IceCream } from 'tabler-icons-react'
import CreatePatientModal from './create-patient-modal'
import { pageSize } from '@/src/app/patients/const'

const queryClient = new QueryClient()

const PaginationExample = (): React.JSX.Element => {
  const [page, setPage] = useState(1)
  const session = useGuaranteeSession()
  const [createModalOpened, setCreateModalOpened] = useState(false)

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
      // console.log('skip and limit: ', PAGE_SIZE * (page - 1), PAGE_SIZE);
      return await patients
    }
    // enabled: false,
  })

  // useEffect(() => {
  //     if (!createModalOpened) {
  //         refetch();
  //     }
  // }, [createModalOpened]);

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

            // TODO: Implement view patient
            // onClick={() => showModal({
            //   patient,
            //   action: 'view'
            // })}
          >
            <IconEye size={23}/>
          </ActionIcon>
          {/* <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="green"
                        onClick={() => {
                            const params: PatientScheme = {
                                name: 'New Patient 10', personal_id: { id: '123456', type: 'SSN' }, birth_date: String(new Date()),
                                active: false,
                                age: 0,
                                gender: 'unspecified',
                                languages: [],
                                emergency_contacts: []
                            };
                            const new_patient = Patient.fromScheme(params);
                            //console.log('Added patient: ', new_patient);
                            Patient.create(params, session);
                            refetch();

                        }}
                    >
                        <IceCream size={23} />
                    </ActionIcon> */}
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => {
              showDeleteModal(patient)
            }}
          >
            <IconTrash size={23}/>
          </ActionIcon>
        </Group>
      )
    }
  ]

  const showDeleteModal = (patient: Patient): void => {
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
      onCancel: () => {
        console.log('Cancel')
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onConfirm: async () => {
        console.log('Deleting patient: ')
        await patient.delete(session)
        await refetch()
      }
    })
  }

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
        // 👇 uncomment the next line to use a custom pagination size
        // paginationSize="md"
        // 👇 uncomment the next line to use a custom loading text
        // loadingText="Loading..."
        // 👇 uncomment the next line to display a custom text when no records were found
        // noRecordsText="No records found"
        // 👇 uncomment the next line to use a custom pagination text
        // paginationText={({ from, to, totalRecords }) => `Records ${from} - ${to} of ${totalRecords}`}
        // 👇 uncomment the next lines to use custom pagination colors
        // paginationActiveBackgroundColor="green"
        // paginationActiveTextColor="#e6e348"

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
