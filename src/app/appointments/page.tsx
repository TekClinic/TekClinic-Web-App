'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Agenda,
  Day,
  Inject,
  Month,
  ScheduleComponent,
  ViewDirective,
  ViewsDirective,
  Week
} from '@syncfusion/ej2-react-schedule'
import './styles.css'
import { useGuaranteeSession } from '@/src/utils/auth'
import { Appointment } from '@/src/api/model/appointment'
import { handleUIError } from '@/src/utils/error'
import { useComputedColorScheme } from '@mantine/core'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { MAX_ITEMS_PER_PAGE } from '@/src/api/common'
import { toast } from 'react-toastify'
import { getToastOptions } from '@/src/utils/toast'
import { type ActionEventArgs, type PopupOpenEventArgs } from '@syncfusion/ej2-schedule/src/schedule/base/interface'
import AppointmentForm, { type AppointmentFormData, isAppointment } from '@/src/app/appointments/AppointmentForm'
import { modals, ModalsProvider } from '@mantine/modals'
import {
  ACTION_DATE_NAVIGATE,
  ACTION_VIEW_NAVIGATE,
  CDN_DARK_THEME_URL,
  CDN_LIGHT_THEME_URL,
  POPUP_TYPE_EDITOR
} from '@/src/app/appointments/const'

const queryClient = new QueryClient()

const Calendar = (): React.JSX.Element => {
  const scheduleObj = useRef<ScheduleComponent>(null)
  const session = useGuaranteeSession()
  const computedColorScheme = useComputedColorScheme()
  const [displayedDates, setDisplayedDates] = useState<Date[]>([])

  const {
    data,
    refetch,
    error
  } = useQuery({
    queryKey: ['appointments', displayedDates],
    queryFn: async () => {
      const result: Appointment[] = []
      await Promise.all(displayedDates.map(async (date) => {
        const {
          items: appointments,
          count
        } = await Appointment.get({
          date,
          limit: MAX_ITEMS_PER_PAGE
        }, session)
        result.push(...appointments)
        if (count > MAX_ITEMS_PER_PAGE) {
          toast.warning(`There are more than ${MAX_ITEMS_PER_PAGE} appointments on ${date.toDateString()}. 
          Showing only the first ${MAX_ITEMS_PER_PAGE}.`, getToastOptions(computedColorScheme))
        }
      }))
      return result
    }
  }, queryClient)

  useEffect(() => {
    if (error != null) {
      handleUIError(error, computedColorScheme, () => {
        void refetch()
      })
    }
  }, [computedColorScheme, error, refetch])

  // updateDisplayedDates is a function that updates the displayed dates.
  // It is used to fetch the appointments for the displayed dates.
  // It is called when the schedule is created and when the view is changed.
  const updateDisplayedDates = (): void => {
    if (scheduleObj?.current != null) {
      setDisplayedDates(scheduleObj.current.getCurrentViewDates())
    }
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
      const editMode = isAppointment(data)

      const modalId = 'appointment-modal'
      modals.open({
        modalId,
        title: editMode ? 'Edit Appointment' : 'Create Appointment',
        children:
          <AppointmentForm
            data={data}
            session={session}
            computedColorScheme={computedColorScheme}
            onSuccess={async () => {
              modals.close(modalId)
              await refetch()
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
        onSuccess={async () => {
          scheduleObj.current?.closeQuickInfoPopup()
          await refetch()
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

  return (
    <ModalsProvider>
      <link href={computedColorScheme === 'light' ? CDN_LIGHT_THEME_URL : CDN_DARK_THEME_URL} rel="stylesheet"/>
      <ScheduleComponent
        currentView="Week" ref={scheduleObj}
        eventSettings={{
          dataSource: data ?? [],
          fields: {
            id: 'id',
            subject: { name: 'subject' },
            startTime: { name: 'start_time' },
            endTime: { name: 'end_time' }
          }
        }}
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
      >
        <ViewsDirective>
          <ViewDirective option="Day"/>
          <ViewDirective option="Week"/>
          <ViewDirective option="Month"/>
          <ViewDirective option="Agenda"/>
        </ViewsDirective>
        <Inject services={[Day, Week, Month, Agenda]}/>
      </ScheduleComponent>
    </ModalsProvider>
  )
}

export default Calendar
