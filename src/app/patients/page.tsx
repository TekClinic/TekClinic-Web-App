'use client'

import dayjs from 'dayjs'
import React from 'react'
import { Patient } from '@/src/api/model/patient'
import { Badge, Flex, useComputedColorScheme } from '@mantine/core'
import CustomTable from '@/src/components/CustomTable'
import { buildDeleteModal } from '@/src/utils/modals'
import { modals } from '@mantine/modals'
import CreatePatientForm from '@/src/app/patients/CreatePatientForm'
import EditPatientForm from './EditPatientForm'

function PatientsPage(): React.JSX.Element {
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
    showCreateModal={({ session, computedColorScheme, onSuccess }) => {
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
      ({ item, session, computedColorScheme, onSuccess }) => {
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
                    from: (computedColorScheme == 'light' ? '#e3e3e3' : '#3d3c3c'),
                    to: (computedColorScheme == 'light' ? '#e3e3e3' : '#3d3c3c'),
                    deg: 90
                  }} style={{ color: computedColorScheme == 'light' ? 'black' : 'white' }}>
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
                    from: computedColorScheme == 'light' ? '#e3e3e3' : '#3d3c3c',
                    to: computedColorScheme == 'light' ? '#e3e3e3' : '#3d3c3c',
                    deg: 90
                  }} style={{ color: computedColorScheme == 'light' ? 'black' : 'white' }}>
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
