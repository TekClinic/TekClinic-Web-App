import React, { useEffect } from 'react'
import { Button, Group, LoadingOverlay, Select, Stack, Switch } from '@mantine/core'
import { useForm } from '@mantine/form'
import { toast } from 'react-toastify'
import { getToastOptions } from '@/src/utils/toast'
import { errorHandler, handleUIError } from '@/src/utils/error'
import { type CreateModalProps } from '@/src/components/CustomTable'
import { Appointment } from '@/src/api/model/appointment'
import { DateTimePicker } from '@mantine/dates'
import { buildDeleteModal } from '@/src/utils/modals'
import { Doctor } from '@/src/api/model/doctor'
import { Patient } from '@/src/api/model/patient'
import { useQuery } from '@tanstack/react-query'

export type AppointmentFormData = { start_time: Date, end_time: Date } | Appointment

interface AppointmentFormProps extends CreateModalProps {
  onSuccess: (data?: AppointmentFormData) => Promise<void>
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
      doctor_id: null as string | null,
      patient_id: null as string | null,
      start_time: data.start_time,
      end_time: data.end_time
    }
    if (editMode) {
      initialValues.doctor_id = data.doctor_id.toString()
      initialValues.patient_id = data.patient_id?.toString() ?? null
    }

    const form = useForm({
      mode: 'uncontrolled',
      validateInputOnBlur: true,
      initialValues,
      validate: {
        doctor_id: (value) => {
          if (value == null) {
            return 'Doctor is required'
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

    const [doctorSearchValue, setDoctorSearchValue] = React.useState<undefined | string>(undefined)
    const [patientSearchValue, setPatientSearchValue] = React.useState<undefined | string>(undefined)

    const {
      error: doctorError,
      isLoading: doctorLoading,
      refetch: refetchDoctors,
      data: doctorOptions
    } = useQuery({
      queryKey: ['doctors', 'search', doctorSearchValue, initialValues.doctor_id],
      queryFn: async () => {
        if (doctorSearchValue == null && initialValues.doctor_id != null) {
          const doctor = await Doctor.getById(parseInt(initialValues.doctor_id), session)
          return [{
            value: doctor.id.toString(),
            label: doctor.name
          }]
        }

        const { items: doctors } = await Doctor.get({ search: doctorSearchValue }, session)
        return doctors.map((doctor) => ({
          value: doctor.id.toString(),
          label: doctor.name
        }))
      }
    })

    const {
      error: patientError,
      isLoading: patientLoading,
      refetch: refetchPatients,
      data: patientOptions
    } = useQuery({
      queryKey: ['patients', 'search', patientSearchValue, initialValues.patient_id],
      queryFn: async () => {
        if (patientSearchValue == null && initialValues.patient_id != null) {
          const patient = await Patient.getById(parseInt(initialValues.patient_id), session)
          return [{
            value: patient.id.toString(),
            label: patient.name
          }]
        }

        const { items: patients } = await Patient.get({ search: patientSearchValue }, session)
        return patients.map((patient) => ({
          value: patient.id.toString(),
          label: patient.name
        }))
      }
    })

    const initialLoading = (doctorSearchValue == null && doctorLoading) || (patientSearchValue == null && patientLoading)
    useEffect(() => {
      if (!initialLoading) {
        return
      }
      if (doctorError != null) {
        handleUIError(doctorError, computedColorScheme, () => {
          void refetchDoctors()
        })
      }
      if (patientError != null) {
        handleUIError(patientError, computedColorScheme, () => {
          void refetchPatients()
        })
      }
    })

    if (initialLoading) {
      return <LoadingOverlay visible/>
    }

    return (
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      <form onSubmit={form.onSubmit(async (values): Promise<void> => {
        const doctorId = (values.doctor_id == null) ? undefined : parseInt(values.doctor_id)
        const patientId = (values.patient_id == null) ? undefined : parseInt(values.patient_id)
        if (doctorId == null) {
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
                pending: 'Creating appointment...',
                success: `Appointment with Dr. ${doctorSearchValue} was created successfully!`,
                error: 'Error while creating appointment...'
              }, getToastOptions(computedColorScheme))
            return
          }
          if (formData.patient_id !== data.patient_id) {
            if (formData.patient_id === undefined) {
              await toast.promise(data.clearPatient(session),
                {
                  pending: 'Unassigning the patient...',
                  success: 'Appointment is available now!',
                  error: 'Error while updating appointment...'
                }, getToastOptions(computedColorScheme))
            } else {
              await toast.promise(data.assignPatient({ patient_id: formData.patient_id }, session),
                {
                  pending: `Assigning ${patientSearchValue}...`,
                  success: `${patientSearchValue} assigned successfully!`,
                  error: 'Error while updating appointment...'
                }, getToastOptions(computedColorScheme))
            }
          }
        }, computedColorScheme)
        if (result instanceof Error) {
          return
        }

        await onSuccess(formData)
      })}>
        <Stack>
          <Select
            withAsterisk={!editMode}
            disabled={editMode}
            clearable
            searchable
            comboboxProps={{ withinPortal: false }}
            label="Doctor"
            description="Doctor performing the appointment"
            placeholder="Select doctor"
            data={doctorOptions}
            onSearchChange={(value) => {
              setDoctorSearchValue(value)
            }}
            nothingFoundMessage="No doctors found"
            key={form.key('doctor_id')}
            {...form.getInputProps('doctor_id')}
          />

          <Select
            clearable
            searchable
            comboboxProps={{ withinPortal: false }}
            label="Patient"
            description="Patient receiving the appointment"
            placeholder="Select patient"
            data={patientOptions}
            onSearchChange={(value) => {
              setPatientSearchValue(value)
            }}
            nothingFoundMessage="No patients found"
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
                    buildDeleteModal<Appointment>('appointment', () => 'The appointment')
                  deleteModal({
                    item: data,
                    session,
                    computedColorScheme,
                    onSuccess: async () => {
                      await onSuccess(data)
                    }
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
