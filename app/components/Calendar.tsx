import React, { useContext, useEffect, useState, useRef } from 'react'
import { AuthContext } from '../context/AuthContextProvider'
import {
  Inject, ScheduleComponent, Day, Week, Month, Year, Agenda, ViewsDirective
  , ViewDirective
} from '@syncfusion/ej2-react-schedule'
import {
  fetchEndpointResponse, fetchAppointmentList, type Appointment, createAppointment, type CreateAppointmentRequest,
  deleteAppointment, type CreateAppointmentResponse
} from '../apiCalls'
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars'
import './MyScheduler.css' // Import CSS for styling

const MyScheduler = (): React.JSX.Element => {
  const scheduleObj = useRef<ScheduleComponent>(null)
  const authContext = useContext(AuthContext)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [, setError] = useState<string | null>(null)

  const onPopupOpen = (args: any): void => {
    if (args.type === 'QuickInfo') {
      args.cancel = true
    }
    if (args.type === 'Editor') {
      const statusElement = args.element.querySelector('#ApprovedByPatient')
      if (statusElement) {
        statusElement.setAttribute('name', 'ApprovedByPatient')
      }
      setTimeout(() => {
        const AddButton = args.element.querySelector('#Add')
        const DeleteButton = args.element.querySelector('#Delete')
        if (AddButton) {
          AddButton.onclick = () => {
            onAddButtonClick(args)
          }
        }
        if (DeleteButton) {
          DeleteButton.onclick = () => {
            onDeleteButtonClick(args)
          }
        }
      }, 100)
    }
  }

  const onAddButtonClick = (args: any): void => {
    const patientId = args.element.querySelector('#PatientId').value
    const doctorId = args.element.querySelector('#DoctorId').value
    const startTime = args.element.querySelector('#StartTime').ej2_instances[0].value
    const endTime = args.element.querySelector('#EndTime').ej2_instances[0].value
    const ApprovedByPatient = args.element.querySelector('#ApprovedByPatient').checked
    const Visited = args.element.querySelector('#Visited').checked

    // Convert the Date objects to ISO 8601 formatted strings with the 'Z' timezone specifier
    const isoStartTime = startTime.toISOString()
    const isoEndTime = endTime.toISOString()

    // Construct the request body
    const data1: CreateAppointmentRequest = {
      patient_id: parseInt(patientId),
      doctor_id: parseInt(doctorId),
      start_time: isoStartTime,
      end_time: isoEndTime
    }
    createAppointment(data1, authContext, setError)
      .then((response: CreateAppointmentResponse) => {
        const createdAppointmentId = response.id.id
        console.log(`Appointment created with ID: ${createdAppointmentId}`)
        const data = {
          Id: String(createdAppointmentId),
          PatientId: patientId,
          DoctorId: doctorId,
          StartTime: startTime,
          EndTime: endTime,
          ApprovedByPatient,
          Visited,
          Subject: String('Appointment Id: ' + createdAppointmentId)
        }
        console.log(data)
        console.log('add')
        console.log(scheduleObj.current?.eventSettings.dataSource)
        scheduleObj.current?.addEvent(data)
        console.log(scheduleObj.current?.eventSettings.dataSource)
      })
      .catch((error: any) => {
        console.error('Error creating appointment:', error)
      })
    scheduleObj.current?.eventWindow.dialogClose()
  }

  const onDeleteButtonClick = (args: any) => {
    const appointmentId = args.element.querySelector('#Id').value
    deleteAppointment(parseInt(appointmentId), authContext, setError)
      .then(() => {
      })
      .catch((error: any) => {
        console.error(`Error deleting appointment with ID ${appointmentId}:`, error)
      })
    scheduleObj.current?.deleteEvent(args.element.querySelector('#Id').value)
    scheduleObj.current?.eventWindow.dialogClose()
  }

  const editorTemplate = (props: any) => {
    return (props !== undefined
      ? <table className="custom-event-editor" style={{ width: '100%', padding: '5' }}><tbody>
      <tr>
        <td className="e-textlabel"></td>
        <td colSpan={4}>
          <input
            id="Id"
            className="e-field e-input"
            type="hidden"
            name="Id"
            value={props.Id ?? ''}
            disabled
            style={{ width: '100%' }}
          />
        </td>
      </tr>
      <tr><td className="e-textlabel">Patient Id</td><td colSpan={4}>
        <input id="PatientId" className="e-field e-input" type="text" name="PatientId" defaultValue={props.PatientId ?? ''} style={{ width: '100%' }} />
      </td></tr>
      <tr><td className="e-textlabel">Doctor Id</td><td colSpan={4}>
      <input id="DoctorId" className="e-field e-input" type="text" name="DoctorId" defaultValue={props.DoctorId ?? ''} style={{ width: '100%' }} />
      </td></tr>
      <tr><td className="e-textlabel">Start time</td><td colSpan={4}>
        <DateTimePickerComponent format='dd/MM/yy HH:mm' id="StartTime" data-name="StartTime" value={new Date(props.startTime || props.StartTime)} className="e-field"></DateTimePickerComponent>
      </td></tr>
      <tr><td className="e-textlabel">End time</td><td colSpan={4}>
        <DateTimePickerComponent format='dd/MM/yy HH:mm' id="EndTime" data-name="EndTime" value={new Date(props.endTime || props.EndTime)} className="e-field"></DateTimePickerComponent>
      </td></tr>
      <tr>
        <td className="e-textlabel">Approved By Patient</td>
        <td colSpan={4}>
          <input
            id="ApprovedByPatient"
            type="checkbox"
            defaultChecked={props.ApprovedByPatient}
            className="e-field e-checkbox"
            style={{ width: 'auto' }}
          />
        </td>
      </tr>
      <tr>
        <td className="e-textlabel">Visited</td>
        <td colSpan={4}>
          <input
            id="Visited"
            type="checkbox"
            defaultChecked={props.Visited}
            className="e-field e-checkbox"
            style={{ width: 'auto' }}
          />
        </td>
      </tr>
      </tbody></table>
      : <div></div>)
  }

  const editorFooterTemplate = (props: any) => {
    return (
      <div id="event-footer" style={{ display: 'flex', justifyContent: 'center' }}>
        {(props !== undefined)
          ? ((props.Id)
              ? <div id="right-button">
            <button id="Delete" className="e-control e-btn e-primary" data-ripple="true" style={{ fontSize: '16px', padding: '10px 20px' }}>
              Delete
            </button>
          </div>
              : <div id="right-button">
            <button id="Add" className="e-control e-btn e-primary" data-ripple="true" style={{ fontSize: '16px', padding: '10px 20px' }}>
              Add
            </button>
          </div>)
          : <div></div>}
      </div>
    )
  }

  const editorHeaderTemplate = (props: any) => {
    return (
        <div id="event-header">
          {(props !== undefined) ? ((props.Id) ? <div>Appointment Details</div> : <div>Create New Appointment</div>) : <div></div>}
        </div>
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const limit = 20
        const offset = 0
        const endpointData1 = await fetchEndpointResponse('appointment', limit, offset, authContext, setError)
        const appointmentListData = await fetchAppointmentList(endpointData1.results, authContext, setError)
        setAppointments(appointmentListData)
      } catch (error) {
        console.error('Error occurred:', error)
        console.error('Logging out...', error)
        void authContext.logout()
      }
    }
    void fetchData()
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username])

  return (
    <ScheduleComponent width='100%' height='700px' currentView='Month' ref={scheduleObj}
      eventSettings={{
        dataSource: appointments.map((appointment: any) => ({
          Id: String(appointment.id),
          PatientId: String(appointment.patient_id),
          DoctorId: String(appointment.doctor_id),
          StartTime: new Date(appointment.start_time),
          EndTime: new Date(appointment.end_time),
          ApprovedByPatient: Boolean(appointment.approved_by_patient),
          Visited: Boolean(appointment.visited),
          Subject: String('Appointment Id: ' + appointment.id)
        }))
      }}
      editorTemplate={editorTemplate.bind(this)}
      popupOpen={onPopupOpen.bind(this)}
      showQuickInfo={true}
      editorHeaderTemplate={editorHeaderTemplate}
      editorFooterTemplate={editorFooterTemplate}
      timeFormat="HH:mm"
      >
        <ViewsDirective>
          <ViewDirective option='Day' />
          <ViewDirective option='Week' />
          <ViewDirective option='Month' />
          <ViewDirective option='Year' />
          <ViewDirective option='Agenda' />
        </ViewsDirective>
      <Inject services={[Day, Week, Month, Year, Agenda]} />
    </ScheduleComponent>
  )
}

export default MyScheduler
