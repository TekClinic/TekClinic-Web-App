import React from 'react'
import { Avatar, Badge, Box, Divider, Group, Text, Stack, MantineColorScheme } from '@mantine/core'
import { type Patient } from '@/src/api/model/patient'
import male_avatar from '@/public/male-patient.webp'
import female_avatar from '@/public/female-patient.webp'
import unknown_avatar from '@/public/unknown-patient.webp'

interface ViewPatientProps {
    computedColorScheme: MantineColorScheme,
    patient: Patient
}

const ViewPatient: React.FC<ViewPatientProps> =
  ({
    computedColorScheme,
    patient,
  }) => 
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
  
export default ViewPatient
