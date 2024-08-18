'use client'

import dayjs from 'dayjs'
import React from 'react'
import { Patient } from '@/src/api/model/patient'
import { Avatar, Badge, Box, Divider, Flex, Group, Stack, Text, useComputedColorScheme } from '@mantine/core'
import CustomTable from '@/src/components/CustomTable'
import { buildDeleteModal } from '@/src/utils/modals'
import { modals } from '@mantine/modals'
import CreatePatientForm from '@/src/app/patients/CreatePatientForm'
import EditPatientForm from './EditPatientForm'
import male_avatar from '@/public/male-patient.webp'
import female_avatar from '@/public/female-patient.webp'
import unknown_avatar from '@/public/unknown-patient.webp'

function PatientsPage (): React.JSX.Element {
  const computedColorScheme = useComputedColorScheme()

  return (
    <CustomTable
      dataName='Patient'
      storeColumnKey='patient-columns'
      queryOptions={(session, page, pageSize) => ({
        queryKey: ['patients', page, pageSize],
        queryFn: async () => {
          return await Patient.get({
            skip: pageSize * (page - 1),
            limit: pageSize
          }, session)
        }
      })}
      showDeleteModal={buildDeleteModal('patient', (patient) => patient.name)}
      showCreateModal={({
        session,
        computedColorScheme,
        onSuccess
      }) => {
        // Generate some random modal id
        const modalId = 'create-patient-modal'
        modals.open({
          modalId,
          title: 'Patient Information',
          children:
            <CreatePatientForm
              session={session}
              computedColorScheme={computedColorScheme}
              onSuccess={async () => {
                modals.close(modalId)
                await onSuccess()
              }}
            />
        })
      }}
      showEditModal={
        ({
          item,
          session,
          computedColorScheme,
          onSuccess
        }) => {
          // Generate some random modal id
          const modalId = 'edit-patient-modal'
          modals.open({
            modalId,
            title: 'Edit Patient Information',
            children:
              <EditPatientForm
                item={item}
                session={session}
                computedColorScheme={computedColorScheme}
                onSuccess={async () => {
                  modals.close(modalId)
                  await onSuccess()
                }}
              />
          })
        }
      }
      showViewModal={
        ({
          item,
          computedColorScheme
        }) => {
          const patient = item
          modals.open({
            title: 'Patient Information',
            centered: true,
            children: (
              <Group align="flex-start">
                <Avatar size={120} radius="120px"
                        src={patient.gender === 'male' ? male_avatar.src : patient.gender === 'female' ? female_avatar.src : unknown_avatar.src}
                        alt="Patient photo"/>
                <Stack>
                  <Box>
                    <Text><strong>Name:</strong> {patient.name}</Text>
                    <Text><strong>Age:</strong> {patient.age}</Text>
                    <Text><strong>Gender:</strong> {patient.gender}</Text>
                    {patient.phone_number !== null && <Text><strong>Phone:</strong> {patient.phone_number}</Text>}
                    <Text><strong>Birth Date:</strong> {patient.birth_date.toLocaleDateString()}</Text>

                    <Text><strong>Languages:</strong></Text>

                    {patient.languages.map((language) => (
                        <Badge key={language} variant="gradient" gradient={{
                          from: (computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c'),
                          to: (computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c'),
                          deg: 90
                        }} style={{ color: computedColorScheme === 'light' ? 'black' : 'white' }}>
                          {language}
                        </Badge>
                    )
                    )}

                    {patient.referred_by !== null && <Text><strong>Referred By:</strong> {patient.referred_by}</Text>}
                    {patient.special_note !== null &&
                        <Text><strong>Special Note:</strong> {patient.special_note}</Text>}
                  </Box>

                  {patient.emergency_contacts.length !== 0 && <Divider my="sm"/>}

                  <Box>
                    {patient.emergency_contacts.length !== 0 && <Text><strong>Emergency Contacts:</strong></Text>}
                    <Stack>
                      {patient.emergency_contacts.map((contact, index) => (
                        <Box key={index}>
                          <Text><strong>Name:</strong> {contact.name}</Text>
                          <Text><strong>Relation:</strong> {contact.closeness}</Text>
                          <Text><strong>Phone:</strong> {contact.phone}</Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Group>
            )
          })
        }
      }
      columns={[
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
          render: (patient: Patient) => patient.active ? 'Active' : 'Inactive'
        },
        {
          accessor: 'age'
        },
        {
          accessor: 'personal_id',
          render: (patient: Patient) => `${patient.personal_id.id} (${patient.personal_id.type})`
        },
        {
          accessor: 'gender',
          render: (patient: Patient) => {
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
          render:
            (patient: Patient) => (
              <Flex style={{ margin: '2px' }} direction='column' gap='10px'>
                {patient.languages.map((language) => (
                    <Badge key={language} variant="gradient" gradient={{
                      from: (computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c'),
                      to: (computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c'),
                      deg: 90
                    }} style={{ color: computedColorScheme === 'light' ? 'black' : 'white' }}>
                      {language}
                    </Badge>
                )
                )}
              </Flex>
            )
        },
        {
          accessor: 'birth_date',
          render:
            (patient: Patient) => dayjs(patient.birth_date).format('YYYY-MM-DD')
        },
        {
          accessor: 'emergency_contacts',
          render:
            (patient: Patient) => (
              <Flex style={{ margin: '2px' }} direction='column' gap='10px'>
                {patient.emergency_contacts.map((contact, index) => (
                    <Badge key={index} variant="gradient" gradient={{
                      from: computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c',
                      to: computedColorScheme === 'light' ? '#e3e3e3' : '#3d3c3c',
                      deg: 90
                    }} style={{ color: computedColorScheme === 'light' ? 'black' : 'white' }}>
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
        }
      ]}
    />
  )
}

export default PatientsPage
