import React from 'react'
import {
  Button,
  Group, Select, TagsInput,
  Textarea,
  TextInput
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { type Gender } from '@/src/api/scheme'
import { toast } from 'react-toastify'
import { getToastOptions } from '@/src/utils/toast'
import { errorHandler } from '@/src/utils/error'
import { type CreateModalProps } from '@/src/components/CustomTable'
import { nameValidator, phoneValidator, specialNoteValidator } from '@/src/utils/validation'
import { Doctor } from '@/src/api/model/doctor'
import { maxSpecialities, specialitiesOptions } from '@/src/app/doctors/const'

type CreateDoctorFormProps = CreateModalProps

const CreateDoctorForm: React.FC<CreateDoctorFormProps> =
  ({
    session,
    computedColorScheme,
    onSuccess
  }) => {
    const form = useForm({
      mode: 'uncontrolled',
      validateInputOnBlur: true,
      initialValues: {
        name: '',
        gender: 'unspecified' as Gender,
        phone_number: '',
        specialities: [] as string[],
        special_note: ''
      },
      validate: {
        name: (value) => nameValidator(value, true),
        phone_number: (value) => phoneValidator(value, true),
        special_note: specialNoteValidator
      }
    })

    return (
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      <form onSubmit={form.onSubmit(async (values): Promise<void> => {
        const result = await errorHandler(async () => {
          await toast.promise(Doctor.create(values, session),
            {
              pending: `Creating doctor ${values.name}...`,
              success: `Doctor ${values.name} was created successfully.`,
              error: 'Error while creating doctor...'
            }, getToastOptions(computedColorScheme))
        }, computedColorScheme)
        if (result instanceof Error) {
          return
        }

        await onSuccess()
      })}>
        <TextInput
          withAsterisk
          label="Full Name"
          placeholder="Joseph Lister"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Select
          label="Gender"
          data={['unspecified', 'male', 'female']}
          placeholder="Select gender"
          key={form.key('gender')}
          {...form.getInputProps('gender')}
        />

        <TextInput
          withAsterisk
          label="Phone Number"
          placeholder="+972505201591"
          key={form.key('phone_number')}
          {...form.getInputProps('phone_number')}
        />

        <TagsInput
          clearable
          label="Specialities"
          maxTags={maxSpecialities}
          data={specialitiesOptions}
          placeholder={`Enter or select up to ${maxSpecialities} specialities`}
          key={form.key('specialities')}
          {...form.getInputProps('specialities')}
        />

        <Textarea
          label="Special Note"
          placeholder="Doesn't answer the phone on weekends"
          {...form.getInputProps('special_note')}
        />

        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    )
  }

export default CreateDoctorForm
