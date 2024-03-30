'use client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import { useContext, useMemo, useState, useEffect, ContextType } from 'react';
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  MRT_PaginationState,
} from 'mantine-react-table';
import { AuthContextValues } from "../context/AuthContextProvider";
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
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData
} from '@tanstack/react-query';
import { PatientResponse, EndpointResponse, fetchEndpointResponse, fetchPatientList } from "../apiCalls";
import { AuthContext } from '../context/AuthContextProvider';
import { defaultNumRows, staleTimeForRefetch } from './consts';
import { useGetPatients } from './patients-utils';


const Example = () => {
  const [error, setError] = useState<string | null>(null);

  //!! Change after backend implementation changes
  const [rowCount, setRowCount] = useState<number>(defaultNumRows);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  // useEffect(() => {
  //   console.log(`pagination changed: pageIndex: ${pagination.pageIndex}, pageSize: ${pagination.pageSize}`);
  //   console.log(`rowsCount: ${rowCount}`);
  // }, [pagination.pageIndex, pagination.pageSize, rowCount]);


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
          //type: 'email',
          required: true,
          // error: validationErrors?.firstName,
          // //remove any previous validation errors when user focuses on the input
          // onFocus: () =>
          //   setValidationErrors({
          //     ...validationErrors,
          //     firstName: undefined,
          //   }),
          //optionally add validation checking for onBlur or onChange
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
        Cell: ({ cell }) => cell.row.original.languages.map((language) => <Badge key={language} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>{language}</Badge>),
        accessorKey: 'languages',
        header: 'Languages',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'list',
          require: true,
        },
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
        //   Cell: ({ cell }) => {
        //     const emergencyContacts = cell.row.original.emergency_contacts.map(contact => {
        //         return `${contact.name} (${contact.closeness}) ${contact.phone.substring(0, 3)}-${contact.phone.substring(3, 6)}-${contact.phone.substring(6, 10)}`;
        //     });
        //     return emergencyContacts.join('\n');
        // }
        Cell: ({ cell }) => cell.row.original.emergency_contacts.map((contact) => <Badge key={contact.name} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
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
    table.setEditingRow(null); //exit editing mode
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
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    //getRowId: (row) => row.id.toString(),
    enableFilters: false,
    enableSorting: false,
    //initialState: { density: 'compact' },
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
      minSize: 20, //allow columns to get smaller than default
      maxSize: 100, //allow columns to get larger than default
      size: 260, //make columns wider by default
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
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
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

//CREATE hook (post new user to api)
function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patient: PatientResponse) => {
      //send api update request here
      // !
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newPatientInfo: PatientResponse) => {
      queryClient.setQueryData(
        ['patients'],
        (prevPatients: any) =>
          [
            ...prevPatients,
            {
              ...newPatientInfo,
              id: (Math.random() * 1000 + 1),
            },
          ] as PatientResponse[],
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}


//UPDATE hook (put user in api)
function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patient: PatientResponse) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newPatientInfo: PatientResponse) => {
      queryClient.setQueryData(['patients'], (prevPatients: any) =>
        prevPatients?.map((prevPatient: PatientResponse) =>
          prevPatient.id === newPatientInfo.id ? newPatientInfo : prevPatient,
        ),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patientId: number) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (patientId: number) => {
      queryClient.setQueryData(['patients'], (prevPatients: any) =>
        prevPatients?.filter((patient: PatientResponse) => patient.id !== patientId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const ExampleWithProviders = () => {
  // const [error, setError] = useState<string | null>(null);

  // const [pagination, setPagination] = useState({
  //   pageIndex: 0,
  //   pageSize: 10,
  // });

  //Put this with your other react-query providers near root of your app
  return (
    <Flex direction="column" style={{ margin: '20px' }}>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Example />
        </ModalsProvider>
      </QueryClientProvider>
    </Flex>
  );
};

export default ExampleWithProviders;

const validateRequired = (value: string) => !!value.length;
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validatePatient(patient: PatientResponse) {
  return {
    name: !validateRequired(patient.name)
      ? 'Name is Required'
      : '',
  };
}