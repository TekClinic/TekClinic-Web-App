'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Day,
  Inject,
  Month,
  ResourceDirective,
  ResourcesDirective,
  ScheduleComponent,
  ViewDirective,
  ViewsDirective,
  Week
} from '@syncfusion/ej2-react-schedule'
import './styles.css'
import { useGuaranteeSession } from '@/src/utils/auth'
import { Appointment } from '@/src/api/model/appointment'
import { handleUIError } from '@/src/utils/error'
import { Avatar, Box, Group, Pagination, Switch, Text, useComputedColorScheme } from '@mantine/core'
import { useQueries } from '@tanstack/react-query'
import { MAX_ITEMS_PER_PAGE } from '@/src/api/common'
import { toast } from 'react-toastify'
import { getToastOptions } from '@/src/utils/toast'
import { type ActionEventArgs, type PopupOpenEventArgs } from '@syncfusion/ej2-schedule/src/schedule/base/interface'
import AppointmentForm, { type AppointmentFormData, isEditMode } from '@/src/app/appointments/AppointmentForm'
import { modals, ModalsProvider } from '@mantine/modals'
import {
  ACTION_DATE_NAVIGATE,
  ACTION_VIEW_NAVIGATE,
  CDN_DARK_THEME_URL,
  CDN_LIGHT_THEME_URL,
  COLORS_RESOURCE,
  DOCTOR_COLORS,
  DOCTORS_PER_PAGE,
  DOCTORS_RESOURCE,
  POPUP_TYPE_EDITOR
} from '@/src/app/appointments/const'
import { IconStethoscope } from '@tabler/icons-react'

interface ResourceData {
  id: number
  color: string
  text: string
}

interface DoctorResourceData extends ResourceData {
  name: string
  specialities: string[]
}

const Calendar = (): React.JSX.Element => {
  const scheduleObj = useRef<ScheduleComponent>(null)
  const session = useGuaranteeSession()
  const computedColorScheme = useComputedColorScheme()
  const [displayedDates, setDisplayedDates] = useState<Date[]>([])

  const [separateByDoctors, setSeparateByDoctors] = useState<boolean>(false)
  const [currentDoctorsPage, setCurrentDoctorsPage] = useState(1)

  const appointmentQueries = useQueries({
    queries: displayedDates.map((date) => ({
      queryKey: ['appointments', 'date', date.toDateString()],
      queryFn: async () => {
        const {
          items,
          count
        } = await Appointment.get({
          date,
          limit: MAX_ITEMS_PER_PAGE
        }, session)
        await Promise.all([
          ...items.map(async (item) => {
            await item.loadDoctor(session)
          }),
          ...items.map(async (item) => {
            await item.loadPatient(session)
          })
        ])
        if (count > MAX_ITEMS_PER_PAGE) {
          toast.warning(`There are more than ${MAX_ITEMS_PER_PAGE} appointments on ${date.toDateString()}. 
          Showing only the first ${MAX_ITEMS_PER_PAGE}.`, getToastOptions(computedColorScheme))
        }
        return items
      },
      staleTime: 0
    }))
  })

  const appointments = appointmentQueries.reduce<Appointment[]>((acc, result) => {
    if (result.data != null) {
      acc.push(...result.data)
    }
    return acc
  }, [])
  const dateToResult = new Map(displayedDates.map((date, index) => [date.toDateString(), appointmentQueries[index]]))

  useEffect(() => {
    appointmentQueries.forEach((result) => {
      if (result.error != null) {
        handleUIError(result.error, computedColorScheme, () => {
          void result.refetch()
        })
      }
    })
  }, [computedColorScheme, appointmentQueries])

  // updateDisplayedDates is a function that updates the displayed dates.
  // It is used to fetch the appointments for the displayed dates.
  // It is called when the schedule is created and when the view is changed.
  const updateDisplayedDates = (): void => {
    if (scheduleObj?.current != null) {
      setDisplayedDates(scheduleObj.current.getCurrentViewDates())
    }
    setCurrentDoctorsPage(1)
  }

  // onActionComplete is a function that is called when a schedule action is completed.
  const onActionComplete = (args: ActionEventArgs): void => {
    if (args.requestType === ACTION_VIEW_NAVIGATE || args.requestType === ACTION_DATE_NAVIGATE) {
      updateDisplayedDates()
    }
  }

  // onPopupOpen is a function that is called when a popup is opened.
  // It is used to replace the default editor with a custom editor.
  const onPopupOpen = (args: PopupOpenEventArgs): void => {
    if (args.type === POPUP_TYPE_EDITOR) {
      args.cancel = true
      if (args.data == null) {
        return
      }
      const data = args.data as AppointmentFormData
      const editMode = isEditMode(data)

      const modalId = 'appointment-modal'
      modals.open({
        modalId,
        title: editMode ? 'Edit Appointment' : 'Create Appointment',
        children:
          <AppointmentForm
            data={data}
            session={session}
            computedColorScheme={computedColorScheme}
            onSuccess={async (data) => {
              modals.close(modalId)
              if (data != null) {
                await dateToResult.get(data.start_time.toDateString())?.refetch()
              }
            }}/>
      })
    }
  }

  // quickInfoContent is a function that returns the content of the quick info popup.
  // It is used to replace the default quick info popup with a custom quick info popup.
  const quickInfoContent = (args: ({ elementType: 'event' } & Appointment) | ({
    elementType: 'cell'
    isAllDay: boolean
    start_time: Date
    end_time: Date
  })): React.JSX.Element => {
    if (args.elementType === 'cell') {
      return <AppointmentForm
        session={session} quick
        computedColorScheme={computedColorScheme}
        onSuccess={async (data) => {
          scheduleObj.current?.closeQuickInfoPopup()
          if (data != null) {
            await dateToResult.get(data.start_time.toDateString())?.refetch()
          }
        }}
        data={{
          start_time: args.start_time,
          end_time: args.end_time
        }}
      />
    }
    // TODO implement quick info
    return <></>
  }

  const resourceHeaderTemplate = (props: { resourceData: DoctorResourceData }): React.JSX.Element => {
    if (props.resourceData.id === 0) {
      return <></>
    }
    return (
      <Box>
        <Avatar color={props.resourceData.color} radius="xl">
          <IconStethoscope size={24}/>
        </Avatar>

        <Box>
          <Text w={500} size="lg">
            Dr. {props.resourceData.name}
          </Text>
          <Text c="dimmed">{props.resourceData.specialities.join(', ')}</Text>
        </Box>
      </Box>
    )
  }

  const data = appointments.map((appointment: Appointment) => {
    return {
      id: appointment.id,
      subject: appointment.subject,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      doctor_id: appointment.doctor_id,
      color_id: appointment.doctor_id % DOCTOR_COLORS.length,
      appointment
    }
  })

  // Resource handling

  const colorsResourceData: ResourceData[] = DOCTOR_COLORS.map((color, index) => ({
    id: index,
    color,
    // just placeholder text
    text: 'Appointment in the Clinic'
  }))

  const doctorsMap = new Map<number, Appointment>()

  appointments.forEach(appointment => doctorsMap.set(appointment.doctor_id, appointment))

  const doctorsResourceData = Array.from(doctorsMap).map(([id, appointment]): DoctorResourceData => ({
    id,
    color: DOCTOR_COLORS[id % DOCTOR_COLORS.length],
    // just placeholder text
    text: 'Appointment in the Clinic',
    name: appointment.getDoctorName(),
    specialities: appointment.getDoctorSpecialities()
  }))

  const paginatedDoctorsResourceData = doctorsResourceData.length > 0
    ? doctorsResourceData.slice(
      (currentDoctorsPage - 1) * DOCTORS_PER_PAGE,
      currentDoctorsPage * DOCTORS_PER_PAGE
    )
    : [{
        id: 0,
        text: 'No doctors',
        color: 'transparent'
      }]

  return (
    <ModalsProvider>
      <link href={computedColorScheme === 'light' ? CDN_LIGHT_THEME_URL : CDN_DARK_THEME_URL} rel="stylesheet"/>
      <Group justify="flex-end" p={10}>
        {separateByDoctors && doctorsResourceData.length > DOCTORS_PER_PAGE &&
            <Pagination
                withControls={false}
                value={currentDoctorsPage}
                onChange={(value) => {
                  setCurrentDoctorsPage(value)
                }}
                total={Math.ceil(doctorsResourceData.length / DOCTORS_PER_PAGE)}
            />}
        <Switch
          checked={separateByDoctors}
          labelPosition="left"
          label='Separate by Doctor'
          onChange={(event) => {
            if (event.currentTarget.checked) {
              setCurrentDoctorsPage(1)
            }
            setSeparateByDoctors(event.currentTarget.checked)
          }}
        />
      </Group>
      <ScheduleComponent
        currentView="Week" ref={scheduleObj}
        eventSettings={{
          dataSource: data,
          fields: {
            id: 'id',
            subject: { name: 'subject' },
            startTime: { name: 'start_time' },
            endTime: { name: 'end_time' }
          }
        }}
        group={{ resources: separateByDoctors ? [DOCTORS_RESOURCE] : [] }}
        allowSwiping
        allowKeyboardInteraction
        rowAutoHeight
        timeFormat="HH:mm"
        actionComplete={onActionComplete}
        actionBegin={onActionComplete}
        quickInfoTemplates={{
          templateType: 'Cell',
          content: quickInfoContent
        }}
        popupOpen={onPopupOpen}
        created={updateDisplayedDates}
        resourceHeaderTemplate={separateByDoctors && resourceHeaderTemplate}
      >
        <ResourcesDirective>
          <ResourceDirective
            field='doctor_id'
            title='Doctor'
            name={DOCTORS_RESOURCE}
            dataSource={separateByDoctors ? paginatedDoctorsResourceData : []}
            textField='text'
            idField='id'
            colorField='color'
          />
          <ResourceDirective
            field='color_id'
            title='Color'
            name={COLORS_RESOURCE}
            dataSource={colorsResourceData}
            textField='text'
            idField='id'
            colorField='color'
          />
        </ResourcesDirective>
        <ViewsDirective>
          <ViewDirective option="Day"/>
          <ViewDirective option="Week"/>
          <ViewDirective option="Month"/>
        </ViewsDirective>
        <Inject services={[Day, Week, Month]}/>
      </ScheduleComponent>
    </ModalsProvider>
  )
}
export default Calendar
