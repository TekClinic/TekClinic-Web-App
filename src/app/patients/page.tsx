'use client'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-react-table/styles.css'
import React, { useContext, useMemo, useState } from 'react'
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  type MRT_PaginationState
} from 'mantine-react-table'
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
  Badge,
  Divider,
  Container
} from '@mantine/core'
import { ModalsProvider, modals } from '@mantine/modals'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { type PatientResponse } from '@/src/api/apiCalls'
import { AuthContext } from '@/src/context/AuthContextProvider'
import { defaultNumRows } from './const'
import { useCreatePatient, useDeletePatient, useGetPatients, useUpdatePatient, validatePatient } from './patients-table-utils'

const PatientsTable = (): React.JSX.Element => {
  const [, setError] = useState<string | null>(null)

  //! ! Change after backend implementation changes
  const [rowCount, setRowCount] = useState<number>(defaultNumRows)

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const authContext = useContext(AuthContext)

  const [, setValidationErrors] = useState<
  Record<string, string | undefined>
  >({})

  const columns = useMemo<Array<MRT_ColumnDef<PatientResponse>>>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        minSize: 40,
        maxSize: 45
      },
      {
        accessorKey: 'name',
        header: 'Name',
        mantineEditTextInputProps: {
          type: 'text',
          required: true
        }
      },
      {
        accessorKey: 'personalId',
        header: 'Personal ID',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: true
        },
        Cell: ({ cell }) => `${cell.row.original.personal_id.id}`
      },
      {
        accessorKey: 'personalIdType',
        header: 'Personal ID Type',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: true
        },
        Cell: ({ cell }) => `${cell.row.original.personal_id.type}`
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'select',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ],
          require: true
        }
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'phone',
          require: true
        },
        Cell: ({ cell }) => `${cell.row.original.phone_number.substring(0, 3)}-${cell.row.original.phone_number.substring(3, 6)}-${cell.row.original.phone_number.substring(6, 10)}`
      },
      {
        accessorKey: 'languages',
        header: 'Languages',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'list',
          require: true
        },
        Cell: ({ cell }) => (
          <Container>
            {cell.row.original.languages.map((language) =>
              <Flex key={language} direction="column" style={{ margin: '2px' }}>
                <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
                  {language}
                </Badge>
              </Flex>)
            }
          </Container >)
      },
      {
        accessorKey: 'birthdate',
        header: 'Birth Date',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'date',
          require: true
        },
        Cell: ({ cell }) => {
          const date = new Date(cell.row.original.birth_date)
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
          return formattedDate
        }
      },
      {
        accessorKey: 'age',
        header: 'Age',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'number',
          require: true
        }
      },
      {
        accessorKey: 'refferedBy',
        header: 'Referred By',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: false
        },
        Cell: ({ cell }) => cell.row.original.referred_by
      },
      {
        accessorKey: 'emergencyContacts',
        header: 'Emergency Contacts',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'list',
          require: false
        },
        Cell: ({ cell }) =>
          <Container style={{ textAlign: 'left' }}>
            {
              cell.row.original.emergency_contacts.map((contact, index) =>
                <Container key={index} >
                  <Badge key={contact.name} variant="gradient" gradient={{ from: '#DBDBDB', to: '#CCCCCC', deg: 90 }} style={{ color: 'black' }}>
                    {contact.name} ({contact.closeness}) {contact.phone.substring(0, 3)}-{contact.phone.substring(3, 6)}-{contact.phone.substring(6, 10)}
                  </Badge>
                  {index !== cell.row.original.emergency_contacts.length - 1 && <Divider my='xs' size="xs" />}
                </Container>)
            }
          </Container>
      },
      {
        accessorKey: 'specialNotes',
        header: 'Special Notes',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: false
        },
        Cell: ({ cell }) => cell.row.original.special_note
      }
    ],
    []
  )

  // call CREATE hook
  const { mutateAsync: createPatient, isPending: isCreatingPatient } =
    useCreatePatient()
  // call READ hook
  const {
    data: fetchedPatients = [],
    isError: isLoadingPatientsError,
    isFetching: isFetchingPatients,
    isLoading: isLoadingPatients
  } = useGetPatients({ authContext, setError, pagination, setRowCount })
  // call UPDATE hook
  const { mutateAsync: updatePatient, isPending: isUpdatingPatient } =
    useUpdatePatient()
  // call DELETE hook
  const { mutateAsync: deletePatient, isPending: isDeletingPatient } =
    useDeletePatient()

  // CREATE action
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const handleCreatePatient: MRT_TableOptions<PatientResponse>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode
  }) => {
    const newValidationErrors = validatePatient(values)
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await createPatient(values)
    exitCreatingMode()
  }

  // UPDATE action
  const handleSavePatient: MRT_TableOptions<PatientResponse>['onEditingRowSave'] = async ({
    values,
    table
  }) => {
    const newValidationErrors = validatePatient(values)
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await updatePatient(values)
    table.setEditingRow(null)
  }

  // DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<PatientResponse>): void => {
    modals.openConfirmModal({
      title: 'Are you sure you want to delete this user?',
      children: (
        <Text>
          Are you sure you want to delete {row.original.name}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onConfirm: async () => { await deletePatient(row.original.id) }
    })
  }

  const table = useMantineReactTable({
    columns,
    data: fetchedPatients,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableFilters: false,
    enableSorting: false,
    mantineToolbarAlertBannerProps: isLoadingPatientsError
      ? {
          color: 'red',
          children: 'Error loading data'
        }
      : undefined,

    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '15', '25', '50', '100', '200', '1000']
    },
    onCreatingRowCancel: () => { setValidationErrors({}) },
    onCreatingRowSave: handleCreatePatient,
    onEditingRowCancel: () => { setValidationErrors({}) },
    onEditingRowSave: handleSavePatient,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Create New User</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Edit User</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    defaultColumn: {
      minSize: 20,
      maxSize: 60
    },
    //! ! for the future: remove this comment and add support for editing rows and deleting rows
    enableEditing: true,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: -45 }} onClick={() => { table.setEditingRow(row) }} >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon variant="gradient" gradient={{ from: '#df1b1b', to: '#ce2525', deg: -45 }} onClick={() => { openDeleteConfirmModal(row) }}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: -45 }}
        onClick={() => {
          table.setCreatingRow(true)
        }}
      >
        Create New Patient
      </Button>
    ),
    enablePagination: true,
    manualPagination: true,
    paginationDisplayMode: 'pages',
    onPaginationChange: setPagination,
    rowCount,
    state: {
      isLoading: isLoadingPatients,
      isSaving: isCreatingPatient || isUpdatingPatient || isDeletingPatient,
      showAlertBanner: isLoadingPatientsError,
      showProgressBars: isFetchingPatients,
      pagination
    }
  })

  return <MantineReactTable table={table} />
}

const queryClient = new QueryClient()

const PatientsTablePage = (): React.JSX.Element => {
  return (
    <Flex direction="column" style={{ margin: '20px' }}>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <PatientsTable />
        </ModalsProvider>
      </QueryClientProvider>
    </Flex>
  )
}

export default PatientsTablePage
