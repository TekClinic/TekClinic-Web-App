'use client'

import React from 'react'
import { Badge, Flex } from '@mantine/core'
import CustomTable from '@/src/components/CustomTable'
import { buildDeleteModal } from '@/src/utils/modals'
import { modals } from '@mantine/modals'
import { Doctor } from '@/src/api/model/doctor'
import CreateDoctorForm from '@/src/app/doctors/CreateDoctorForm'

const DoctorPage = (): React.JSX.Element => (
  <CustomTable
    dataName='Doctor'
    storeColumnKey='doctor-columns'
    queryOptions={(session, page, pageSize) => ({
      queryKey: ['doctors', page, pageSize],
      queryFn: async () => {
        return await Doctor.get({
          skip: pageSize * (page - 1),
          limit: pageSize
        }, session)
      }
    })}
    showDeleteModal={buildDeleteModal('doctor', (doctor) => doctor.name)}
    showCreateModal={({
      session,
      computedColorScheme,
      onSuccess
    }) => {
      // Generate some random modal id
      const modalId = 'create-doctor-modal'
      modals.open({
        modalId,
        title: 'Doctor Information',
        children:
          <CreateDoctorForm
            session={session}
            computedColorScheme={computedColorScheme}
            onSuccess={async () => {
              modals.close(modalId)
              await onSuccess()
            }}
          />
      })
    }}
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
        render: (doctor: Doctor) => doctor.active ? 'Active' : 'Inactive'
      },
      {
        accessor: 'gender',
        render: (doctor: Doctor) => {
          let color = 'gray'
          if (doctor.gender === 'male') {
            color = 'blue'
          } else if (doctor.gender === 'female') {
            color = 'pink'
          }
          return <Badge color={color}>{doctor.gender}</Badge>
        }
      },
      {
        accessor: 'phone_number'
      },
      {
        accessor: 'specialities',
        render:
          (doctor: Doctor) => (
            <Flex style={{ margin: '2px' }} direction='column' gap='10px'>
              {doctor.specialities.map((speciality) => (
                  <Badge key={speciality} variant="gradient" gradient={{
                    from: 'blue',
                    to: 'cyan',
                    deg: 90
                  }}>
                    {speciality}
                  </Badge>
              )
              )}
            </Flex>
          )
      },
      {
        accessor: 'special_note'
      }
    ]}
  />
)

export default DoctorPage
