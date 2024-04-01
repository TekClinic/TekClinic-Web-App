'use client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { useContext, useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  MRT_PaginationState,
} from 'mantine-react-table';
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
  Badge,
} from '@mantine/core';
import { ModalsProvider, modals } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { PatientResponse } from "../apiCalls";
import { AuthContext } from '../context/AuthContextProvider';
import { defaultNumRows } from './consts';
import { useCreatePatient, useDeletePatient, useGetPatients, useUpdatePatient, validatePatient } from './patients-utils';


const PatientsTable = () => {
  const [error, setError] = useState<string | null>(null);

  //!! Change after backend implementation changes
  const [rowCount, setRowCount] = useState<number>(defaultNumRows);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });


  const authContext = useContext(AuthContext);


  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<PatientResponse>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
        },
      },
      {
        accessorKey: 'personalId',
        header: 'Personal ID',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: true,
        },
        Cell: ({ cell }) => `${cell.row.original.personal_id.id} (${cell.row.original.personal_id.type})`,
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'select',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
          require: true,
        },
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'phone',
          require: true,
        },
        Cell: ({ cell }) => `${cell.row.original.phone_number.substring(0, 3)}-${cell.row.original.phone_number.substring(3, 6)}-${cell.row.original.phone_number.substring(6, 10)}`,
      },
      {
        accessorKey: 'languages',
        header: 'Languages',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'list',
          require: true,
        },
        Cell: ({ cell }) => cell.row.original.languages.map((language) => <Badge key={language} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>{language}</Badge>),
      },
      {
        accessorKey: 'birthdate',
        header: 'Birth Date',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'date',
          require: true,
        },
        Cell: ({ cell }) => `${cell.row.original.birth_date.month}/${cell.row.original.birth_date.day}/${cell.row.original.birth_date.year}`,
      },
      {
        accessorKey: 'age',
        header: 'Age',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'number',
          require: true,
        },
      },
      {
        accessorKey: 'refferedBy',
        header: 'Referred By',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: false,
        },
        Cell: ({ cell }) => cell.row.original.referred_by,
      },
      {
        accessorKey: 'emergencyContacts',
        header: 'Emergency Contacts',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'list',
          require: false,
        },
        Cell: ({ cell }) => cell.row.original.emergency_contacts.map((contact) => <Badge key={contact.name} variant="gradient" gradient={{ from: '#DBDBDB', to: '#CCCCCC', deg: 90 }} style={{ color: 'black' }}>
          {contact.name} ({contact.closeness}) {contact.phone.substring(0, 3)}-{contact.phone.substring(3, 6)}-{contact.phone.substring(6, 10)}</Badge>),
      },
      {
        accessorKey: 'specialNotes',
        header: 'Special Notes',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: false,
        },
        Cell: ({ cell }) => cell.row.original.special_note,
      },
    ],
    [validationErrors],
  );

  //call CREATE hook
  const { mutateAsync: createPatient, isPending: isCreatingPatient } =
    useCreatePatient();
  //call READ hook
  const {
    data: fetchedPatients = [],
    isError: isLoadingPatientsError,
    isFetching: isFetchingPatients,
    isLoading: isLoadingPatients,
  } = useGetPatients({ authContext, setError, pagination, setRowCount });
  //call UPDATE hook
  const { mutateAsync: updatePatient, isPending: isUpdatingPatient } =
    useUpdatePatient();
  //call DELETE hook
  const { mutateAsync: deletePatient, isPending: isDeletingPatient } =
    useDeletePatient();

  //CREATE action
  const handleCreatePatient: MRT_TableOptions<PatientResponse>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validatePatient(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createPatient(values);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSavePatient: MRT_TableOptions<PatientResponse>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validatePatient(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updatePatient(values);
    table.setEditingRow(null);
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<PatientResponse>) =>
    modals.openConfirmModal({
      title: 'Are you sure you want to delete this user?',
      children: (
        <Text>
          Are you sure you want to delete {row.original.name}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deletePatient(row.original.id),
    });

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
        children: 'Error loading data',
      }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '15', '25', '50', '100', '200', '1000'],
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreatePatient,
    onEditingRowCancel: () => setValidationErrors({}),
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
      maxSize: 80,
      size: 200,
    },
    //!! for the future: remove this comment and add support for editing rows and deleting rows
    enableEditing: true,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: -45 }} onClick={() => table.setEditingRow(row)} >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon variant="gradient" gradient={{ from: '#df1b1b', to: '#ce2525', deg: -45 }} onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: -45 }}
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Create New Patient
      </Button>
    ),
    enablePagination: true,
    manualPagination: true,
    paginationDisplayMode: 'pages',
    onPaginationChange: setPagination,
    rowCount: rowCount,
    state: {
      isLoading: isLoadingPatients,
      isSaving: isCreatingPatient || isUpdatingPatient || isDeletingPatient,
      showAlertBanner: isLoadingPatientsError,
      showProgressBars: isFetchingPatients,
      pagination: pagination,
    },
  });

  return <MantineReactTable table={table} />;
};


const queryClient = new QueryClient();

const PatientsTablePage = () => {
  return (
    <Flex direction="column" style={{ margin: '20px' }}>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <PatientsTable />
        </ModalsProvider>
      </QueryClientProvider>
    </Flex>
  );
};

export default PatientsTablePage;