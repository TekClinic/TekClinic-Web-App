import React, { type Dispatch, type SetStateAction, useState } from 'react'
import { ActionIcon, Button, Group, Modal, MultiSelect, Select, Textarea, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Patient } from '@/src/api/model/patient'
import { type Session } from 'next-auth'
import { type EmergencyContact, type Gender, type PersonalId } from '@/src/api/scheme'
import validator from 'validator'
import { phone } from 'phone'
import { type QueryObserverResult, type RefetchOptions } from '@tanstack/react-query'
import {
  israeliIDType,
  maxClosenessLength,
  maxIDLength,
  maxIDTypeLength,
  maxLanguages,
  maxNameLength,
  maxSpecialNoteLength,
  minClosenessLength,
  minIDLength,
  minIDTypeLength,
  minNameLength,
  otherIDType
} from '@/src/app/patients/const'

interface CreatePatientModalProps {
  opened: boolean
  onClose: () => void
  session: Session
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<{
    items: Patient[]
    count: number
  }, Error>>
  setModalOpened: Dispatch<SetStateAction<boolean>>
}

const CreatePatientModal: React.FC<CreatePatientModalProps> =
  ({
    opened,
    onClose,
    session,
    setModalOpened,
    refetch
  }) => {
    const [showOtherIdType, setShowOtherIdType] = useState<boolean>(false)

    const form = useForm({
      mode: 'uncontrolled',
      validateInputOnBlur: true,
      initialValues: {
        name: '',
        personal_id: {
          id: '',
          type: israeliIDType,
          other: ''
        },
        gender: 'unspecified' as Gender,
        phone_number: '',
        languages: [] as string[],
        birth_date: null as Date | null,
        referred_by: '',
        special_note: '',
        emergency_contacts: [] as EmergencyContact[]
      },
      validate: {
        name: (value) => nameValidator(value, true),
        personal_id: {
          id: (value, values) => {
            if (validator.isEmpty(value)) {
              return 'Personal ID number is required'
            }
            if (values.personal_id.type === israeliIDType) {
              if (!isValidIsraeliID(value)) {
                return 'Invalid Israeli ID'
              }
            } else if (!validator.isLength(value, {
              min: minIDLength,
              max: maxIDLength
            })) {
              return `Personal ID number must be between ${minIDLength} and ${maxIDLength} characters`
            }
            return null
          },
          other: (value, values) => {
            if (values.personal_id.type === otherIDType && !validator.isLength(value, {
              min: minIDTypeLength,
              max: maxIDTypeLength
            })) {
              return `ID type must be between ${minIDTypeLength} and ${maxIDTypeLength} characters`
            }
            return null
          }
        },
        phone_number: (value) => phoneValidator(value),
        languages: (value) => {
          if (value.length > maxLanguages) {
            return `Languages must be less than ${maxLanguages}`
          }
          return null
        },
        birth_date: (value) => {
          if (value == null) {
            return 'Birth date is required'
          }
          return null
        },
        emergency_contacts: {
          name: (value) => nameValidator(value, true),
          closeness: (value) => {
            if (!validator.isLength(value, {
              min: minClosenessLength,
              max: maxClosenessLength
            })) {
              return `Closeness must be between ${minClosenessLength} and ${maxClosenessLength} characters`
            }
            return null
          },
          phone: (value) => phoneValidator(value, true)
        },
        referred_by: (value) => nameValidator(value),
        special_note: (value) => {
          if (!validator.isLength(value, {
            max: maxSpecialNoteLength
          })) {
            return `Special note must be less than ${maxSpecialNoteLength} characters`
          }
          return null
        }
      }
    })

    return (
      <Modal opened={opened} onClose={onClose} title="Patient Information Form">
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={form.onSubmit(async (values) => {
          const personalId: PersonalId = {
            id: values.personal_id.id,
            type: values.personal_id.type === otherIDType ? values.personal_id.other : values.personal_id.type
          }
          const birthDate = values.birth_date
          if (birthDate == null) {
            // unreachable state due to the validation
            throw new Error('Birth date is required')
          }
          await Patient.create({
            ...values,
            personal_id: personalId,
            birth_date: birthDate
          }, session)
          setModalOpened(false)

          form.reset()
          await refetch()
        })}>
          <TextInput
            withAsterisk
            label="Full Name"
            placeholder="Henry Smith"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <TextInput
            withAsterisk
            label="Personal ID"
            placeholder="3523651512"
            key={form.key('personal_id.id')}
            {...form.getInputProps('personal_id.id')}
          />

          <Select
            withAsterisk
            label="ID Type"
            data={[israeliIDType, 'Passport', 'Drivers Licence', otherIDType]}
            placeholder="Select ID type"
            key={form.key('personal_id.type')}
            {...form.getInputProps('personal_id.type')}
            onChange={(value) => {
              if (value === null) {
                return
              }
              form.setFieldValue('personal_id.type', value)
              setShowOtherIdType(value === otherIDType)
            }}
          />

          {showOtherIdType && (
            <TextInput
              withAsterisk
              placeholder="Specify other ID type"
              key={form.key('personal_id.other')}
              {...form.getInputProps('personal_id.other')}
            />
          )}

          <Select
            label="Gender"
            data={['unspecified', 'male', 'female']}
            placeholder="Select gender"
            key={form.key('gender')}
            {...form.getInputProps('gender')}
          />

          <TextInput
            label="Phone Number"
            placeholder="+972505201591"
            key={form.key('phone_number')}
            {...form.getInputProps('phone_number')}
          />

          <MultiSelect
            label="Languages"
            data={['Hebrew', 'Spanish', 'English', 'Russian', 'Arabic', 'French']}
            placeholder="Select languages"
            key={form.key('languages')}
            {...form.getInputProps('languages')}
          />

          <DateInput
            withAsterisk
            label="Birth Date"
            placeholder="2000-07-21"
            key={form.key('birth_date')}
            {...form.getInputProps('birth_date')}
          />

          {form.getValues().emergency_contacts.map((_, index) => (
            <Group key={`emergency_contacts.${index}`}>
              <TextInput
                withAsterisk
                label="Emergency Contact Name"
                placeholder="Alexa Smith"
                key={form.key(`emergency_contacts.${index}.name`)}
                {...form.getInputProps(`emergency_contacts.${index}.name`)}
              />
              <TextInput
                withAsterisk
                label="Closeness"
                placeholder="Mother"
                key={form.key(`emergency_contacts.${index}.closeness`)}
                {...form.getInputProps(`emergency_contacts.${index}.closeness`)}
              />
              <TextInput
                withAsterisk
                label="Phone"
                placeholder="+972603159352"
                key={form.key(`emergency_contacts.${index}.phone`)}
                {...form.getInputProps(`emergency_contacts.${index}.phone`)}
              />
              <ActionIcon color="red" onClick={() => {
                form.removeListItem('emergency_contacts', index)
              }}>
                <IconTrash size={16}/>
              </ActionIcon>
            </Group>
          ))}

          <Group mt="md">
            <Button variant="outline" onClick={() => {
              form.insertListItem('emergency_contacts', {
                name: '',
                closeness: '',
                phone: ''
              } satisfies EmergencyContact)
            }} size="xs" leftSection={<IconPlus size={14}/>}>
              Add Emergency Contact
            </Button>
          </Group>

          <TextInput
            label="Referred By"
            placeholder="John"
            {...form.getInputProps('referred_by')}
          />

          <Textarea
            label="Special Note"
            placeholder="Can't answer calls between 12:00 and 20:00"
            {...form.getInputProps('special_note')}
          />

          <Group mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Modal>
    )
  }

const isValidIsraeliID = (id: string): boolean => {
  if (id.length !== 9 || isNaN(parseInt(id))) {
    return false
  }

  const digits = id.split('').map(Number)
  const sum = digits.reduce((acc, digit, i) => {
    let step = digit * ((i % 2) + 1)
    if (step > 9) step -= 9
    return acc + step
  }, 0)

  return sum % 10 === 0
}

const phoneValidator = (value: string, required: boolean = false): string | null => {
  if (validator.isEmpty(value)) {
    return required ? 'Phone number is required' : null
  }
  if (!(phone(value).isValid || phone(value, { country: 'ISR' }).isValid)) {
    return 'Invalid phone number'
  }
  return null
}

const nameValidator = (value: string, required: boolean = false): string | null => {
  if (validator.isEmpty(value)) {
    return required ? 'Name is required' : null
  }
  if (!validator.isLength(value, {
    min: minNameLength,
    max: maxNameLength
  })) {
    return `Name must be between ${minNameLength} and ${maxNameLength} characters`
  }
  return null
}

export default CreatePatientModal
