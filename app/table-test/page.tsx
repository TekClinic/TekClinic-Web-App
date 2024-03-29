'use client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import { useContext, useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MantineReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { ModalsProvider, modals } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
// import { type User, fakeData, usStates } from './makeData';

import { PatientResponse, EndpointResponse, fetchEndpointResponse, fetchPatientList } from "../apiCalls";
import { AuthContext } from '../context/AuthContextProvider';
//import { type User, fakeData, usStates } from './makeData';

//const authContext = useContext(AuthContext);

const defaultLimit = 10;
const defaultOffset = 0;
let defaultCount = 1;

// useEffect(() => {
//   //do something when the pagination state changes
// }, [pagination.pageIndex, pagination.pageSize]);


// const fetchEndpointData = async (limit: number, offset: number) => {
//   const authContext = useContext(AuthContext);

//   try {
//     const patientEndpointData = await fetchEndpointResponse("patient", limit, offset, authContext, setError);
//     //console.log(patientEndpointData);
//     //setPatientEndpointResponse(patientEndpointData);

//     defaultCount = Math.ceil(patientEndpointData.count / defaultLimit);

//     const fetchPatientListData = async () => {
//       try {
//         const patientListData = await fetchPatientList(patientEndpointData.results, authContext, setError);
//         //console.log(patientListData);
//         //setPatientList(patientListData);
//       } catch (error) {
//         console.error('Error occurred:', error);
//         console.error('Logging out...', error);
//         authContext.logout();
//       }
//     };
//     fetchPatientListData();

//   } catch (error) {
//     console.error('Error occurred:', error);
//     console.error('Logging out...', error);
//     authContext.logout();
//   }
// };

const Example = () => {
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const authContext = useContext(AuthContext);

  const fetchEndpointData = async (limit: number, offset: number) => {

    try {
      const patientEndpointData = await fetchEndpointResponse("patient", limit, offset, authContext, setError);
      //console.log(patientEndpointData);
      //setPatientEndpointResponse(patientEndpointData);

      defaultCount = Math.ceil(patientEndpointData.count / defaultLimit);

      const fetchPatientListData = async () => {
        try {
          const patientList = await fetchPatientList(patientEndpointData.results, authContext, setError);
          // console.log("tryyyy");
          console.log(patientList[0]['personal_id']);
          return patientList;
          //return new Promise((resolve) => patientList);
          //console.log(patientListData);
          //setPatientList(patientListData);
        } catch (error) {
          console.error('Error occurred:', error);
          console.error('Logging out...', error);
          //authContext.logout();
        }
      };
      return fetchPatientListData();

    } catch (error) {
      console.error('Error occurred:', error);
      console.error('Logging out...', error);
      //authContext.logout();
    }
  };

  function useGetPatients() {
    return useQuery<PatientResponse[]>({
      queryKey: ['patients'],
      queryFn: () => fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize),
      // queryFn: async () => {
      //   //send api request here
      //   // !

      //   return (new Promise((resolve) => fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize)));

      //   //const data = fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize);
      //   //return Promise.resolve(data);
      //   //await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      //   // return Promise.resolve(fakeData);
      // },
      refetchOnWindowFocus: false,
    });
  }

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
      },
      {
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
      },
      {
        accessorKey: 'emergencyContacts',
        header: 'emergency_contacts',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'list',
          require: false,
        },
      },
      {
        accessorKey: 'specialNotes',
        header: 'Special Notes',
        enableEditing: true,
        mantineEditTextInputProps: {
          type: 'text',
          require: false,
        },
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
  } = useGetPatients();
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
    enableEditing: true,
    //getRowId: (row) => row.id.toString(),
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
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
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
        Create New User
      </Button>
    ),
    onPaginationChange: setPagination,
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

//READ hook (get users from api)
// function useGetPatients() {
//   return useQuery<PatientResponse[]>({
//     queryKey: ['patients'],
//     queryFn: async () => {
//       //send api request here
//       // !

//       return (new Promise((resolve) => fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize)));

//       //const data = fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize);
//       //return Promise.resolve(data);
//       //await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       // return Promise.resolve(fakeData);
//     },
//     refetchOnWindowFocus: false,
//   });
// }

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
    <QueryClientProvider client={queryClient}>
      <ModalsProvider>
        <Example />
      </ModalsProvider>
    </QueryClientProvider>
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