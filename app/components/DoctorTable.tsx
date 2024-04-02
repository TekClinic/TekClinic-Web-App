import { Table } from '@mantine/core'
import { type DoctorResponse } from '../apiCalls'
import React from 'react'

const generateDoctorRows = (doctorList: DoctorResponse[]): React.JSX.Element[] => {
  return doctorList.map((doctor) => (
    <Table.Tr key={doctor.id}>
      <Table.Td>{doctor.name}</Table.Td>
      <Table.Td>{doctor.gender}</Table.Td>
      <Table.Td>{doctor.phone_number}</Table.Td>
      <Table.Td>{doctor.specialities.join(', ')}</Table.Td>
      <Table.Td>{doctor.special_note}</Table.Td>
    </Table.Tr>
  ))
}

const DoctorTable: React.FC<{ rows: React.ReactNode }> = ({ rows }) => (
  <Table striped highlightOnHover withTableBorder withColumnBorders>
    <Table.Thead>
      <Table.Tr style={{ backgroundColor: 'gray' }}>
        <Table.Th>Name</Table.Th>
        <Table.Th>Gender</Table.Th>
        <Table.Th>Phone Number</Table.Th>
        <Table.Th>Specialities</Table.Th>
        <Table.Th>Special Note</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>{rows}</Table.Tbody>
  </Table>
)

export { generateDoctorRows, DoctorTable as default }
