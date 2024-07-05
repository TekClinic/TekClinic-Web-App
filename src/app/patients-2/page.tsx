'use client';

import { DataTable, DataTableProps } from 'mantine-datatable';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import companies from './companies.json';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useGuaranteeSession } from '@/src/utils/auth';
import { Patient } from '@/src/api/model/patient';
import { modals, ModalsProvider } from '@mantine/modals';
import { ActionIcon, Box, Group, Text } from '@mantine/core';
import { IconEye, IconTrash } from '@tabler/icons-react';
import { IceCream } from 'tabler-icons-react';
import { PatientScheme } from '@/src/api/scheme';


const PAGE_SIZE = 1;

const queryClient = new QueryClient()

function PaginationExample() {
    const [page, setPage] = useState(1);
    const session = useGuaranteeSession();

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['patients', page, PAGE_SIZE],
        queryFn: getQueryData,
        //enabled: false,
    });

    function getQueryData() {
        const patients = Patient.get({ skip: PAGE_SIZE * (page - 1), limit: PAGE_SIZE }, session);
        console.log('skip and limit: ', PAGE_SIZE * (page - 1), PAGE_SIZE);
        return patients;
    }

    useEffect(() => {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        // refetch();
    }, [page]);

    const columns: DataTableProps<Patient>['columns'] = [
        { accessor: 'id', width: 100 },
        { accessor: 'name', width: 100 },
        { accessor: 'active', width: 100, render: (patient) => patient.active ? 'Active' : 'Inactive'},
        { accessor: 'age', width: 100 },
        { accessor: 'personal_id', width: 100, render: (patient) => `${patient.personal_id.id} (${patient.personal_id.type})` },
        { accessor: 'gender', width: 100 },
        { accessor: 'phone_number', width: 100, render: (patient) => patient.phone_number || 'N/A' },
        { accessor: 'languages', width: 100, render: (patient) => patient.languages.join(', ') },
        { accessor: 'birth_date', width: 100, render: (patient) => dayjs(patient.birth_date).format('YYYY-MM-DD') },
        { accessor: 'emergency_contacts', width: 100, render: (patient) => patient.emergency_contacts.map((contact) => `${contact.name} (${contact.phone})`).join(', ') },
        { accessor: 'referred_by', width: 100, render: (patient) => patient.referred_by || '' },
        { accessor: 'special_note', width: 100, render: (patient) => patient.special_note || '' },
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
                  onClick={() => showModal({ patient, action: 'view' })}
                >
                  <IconEye size={23} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="green"
                  onClick={() => { const params : PatientScheme = {
                      name: 'New Patient 8', personal_id: { id: '123456', type: 'SSN' }, birth_date: String(new Date()),
                      id: 0,
                      active: false,
                      age: 0,
                      gender: 'unspecified',
                      languages: [],
                      emergency_contacts: []
                  };
                    const new_patient = Patient.fromScheme(params);
                    console.log('Added patient: ', new_patient); 
                    Patient.create(params, session);
                    refetch();

                }}
                >
                  <IceCream size={23} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => showDeleteModal(patient)}
                >
                  <IconTrash size={23} />
                </ActionIcon>
              </Group>
            ),
          },
    ]

    function showModal({ patient, action }: { patient: Patient, action: string }) {
        console.log('showModal', patient, action);
    }

    function showDeleteModal(patient: Patient) {        
         return modals.openConfirmModal({
            title: 'Please confirm deletion of patient: ' + patient.name + '\n with id: ' + patient.id,
            centered: true,
            children: (
              <Text size="sm">
                Clicking on Delete will permanently delete the patient.
                Clicking on Cancel will close this dialog and cancel the deletion.
              </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: () => console.log('Deleted'),
          });   
    }



    return (
        <DataTable
            height={300}
            withTableBorder
            columns={columns}
            fetching={isFetching}
            records={data?.items}
            page={page}
            onPageChange={setPage}
            totalRecords={data?.count}
            recordsPerPage={PAGE_SIZE}
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
    );
}

export default function PatientsPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <ModalsProvider>
                <PaginationExample />
            </ModalsProvider>
        </QueryClientProvider>
    );
}