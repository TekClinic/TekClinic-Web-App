import React from 'react'
import { Button, Group, NumberInput, Stack, Switch } from '@mantine/core'
import { useForm } from '@mantine/form'
import { toast } from 'react-toastify'
import { getToastOptions } from '@/src/utils/toast'
import { errorHandler } from '@/src/utils/error'
import { type CreateModalProps } from '@/src/components/CustomTable'
import { Appointment } from '@/src/api/model/appointment'
import { DateTimePicker } from '@mantine/dates'
import { buildDeleteModal } from '@/src/utils/modals'

export type AppointmentFormData = { start_time: Date, end_time: Date } | Appointment

interface AppointmentFormProps extends CreateModalProps {
  data: AppointmentFormData
  quick?: boolean
}

export const isAppointment = (data: AppointmentFormData): data is Appointment => {
  return Object.prototype.hasOwnProperty.call(data, 'id')
}

const AppointmentForm: React.FC<AppointmentFormProps> =
  ({
    session,
    computedColorScheme,
    onSuccess,
    data,
    quick
  }) => {
    const editMode = isAppointment(data)
    const initialValues = {
      doctor_id: '' as number | '',
      patient_id: '' as number | '',
      start_time: data.start_time,
      end_time: data.end_time
    }
    if (editMode) {
      initialValues.doctor_id = data.doctor_id
      initialValues.patient_id = data.patient_id ?? ''
    }

    const form = useForm({
      mode: 'uncontrolled',
      validateInputOnBlur: true,
      initialValues,
      validate: {
        doctor_id: (value) => {
          if (value === '') {
            return 'Doctor is required'
          }
          if (value <= 0) {
            return 'Doctor ID must be a positive number'
          }
          return null
        },
        patient_id: (value) => {
          if (value === '') {
            return null
          }
          if (value <= 0) {
            return 'Patient ID must be a positive number'
          }
          return null
        },
        end_time: (value, { start_time: startTime }) => {
          if (value < startTime) {
            return 'End time must be after start time'
          }
          return null
        }
      }
    })

    return (
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      <form onSubmit={form.onSubmit(async (values): Promise<void> => {
        const doctorId = values.doctor_id
        const patientId = (values.patient_id === '') ? undefined : values.patient_id
        if (doctorId === '') {
          // unreachable due to validation
          return
        }
        const formData = {
          ...values,
          doctor_id: doctorId,
          patient_id: patientId
        }

        const result = await errorHandler(async () => {
          if (!editMode) {
            await toast.promise(Appointment.create(formData, session),
              {
                pending: `Creating appointment with ${values.doctor_id}...`,
                success: `Appointment with ${values.doctor_id} was created successfully.`,
                error: 'Error while creating appointment...'
              }, getToastOptions(computedColorScheme))
            return
          }
          if (formData.patient_id !== data.patient_id) {
            if (formData.patient_id === undefined) {
              await toast.promise(data.clearPatient(session),
                {
                  pending: `Unassigning ${data.patient_id}...`,
                  success: 'Appointment is available now!',
                  error: 'Error while updating appointment...'
                }, getToastOptions(computedColorScheme))
            } else {
              await toast.promise(data.assignPatient({ patient_id: formData.patient_id }, session),
                {
                  pending: `Assigning ${formData.patient_id}...`,
                  success: 'Patient assigned successfully.',
                  error: 'Error while updating appointment...'
                }, getToastOptions(computedColorScheme))
            }
          }
        }, computedColorScheme)
        if (result instanceof Error) {
          return
        }

        await onSuccess()
      })}>
        <Stack>
          <NumberInput
            withAsterisk={!editMode}
            disabled={editMode}
            label="Doctor ID"
            description="Doctor performing the appointment"
            placeholder="15"
            key={form.key('doctor_id')}
            {...form.getInputProps('doctor_id')}
          />

          <NumberInput
            label="Patient ID"
            description="Patient receiving the appointment"
            placeholder="10"
            key={form.key('patient_id')}
            {...form.getInputProps('patient_id')}
          />

          {(quick !== true) &&
              <Group mt="md" justify="space-between" grow>
                  <DateTimePicker
                      withAsterisk={!editMode}
                      disabled={editMode}
                      label="Start Time"
                      placeholder="Select start time"
                      key={form.key('start_time')}
                      {...form.getInputProps('start_time')}
                  />

                  <DateTimePicker
                      withAsterisk={!editMode}
                      disabled={editMode}
                      label="End Time"
                      placeholder="Select end time"
                      key={form.key('end_time')}
                      {...form.getInputProps('end_time')}
                  />
              </Group>}

          {editMode &&
              <>
                  <Switch
                      label="Patient confirmed the visit"
                      checked={data.approved_by_patient}
                      disabled
                  />
                  <Switch
                      label="Patient visited the appointment"
                      checked={data.visited}
                      disabled
                  />
              </>
          }

          <Group mt="md" justify="right">
            {editMode &&
                <Button color="red" variant="outline" onClick={() => {
                  const deleteModal =
                    buildDeleteModal<Appointment>('appointment', (appointment) => appointment.getSubject())
                  deleteModal({
                    item: data,
                    session,
                    computedColorScheme,
                    onSuccess
                  })
                }}>Delete</Button>
            }
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
    )
  }

export default AppointmentForm
