import React, { useEffect, useRef, useState } from 'react'
import {
  Agenda,
  Day,
  Inject,
  Month,
  ScheduleComponent,
  ViewDirective,
  ViewsDirective,
  Week,
  Year
} from '@syncfusion/ej2-react-schedule'
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars'
import './Calendar.css'
import { useGuaranteeSession } from '@/src/utils/auth'

import 'react-toastify/dist/ReactToastify.css'
import { Appointment } from '@/src/api/model/appointment'
import { errorHandler } from "@/src/utils/error"
import { useMantineColorScheme } from "@mantine/core"

const MyScheduler = (): React.JSX.Element => {
  const scheduleObj = useRef<ScheduleComponent>(null)
  const session = useGuaranteeSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const {colorScheme} = useMantineColorScheme()

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
        const AssignButton = args.element.querySelector('#Assign')
        const CancelButton = args.element.querySelector('#Cancel')
        if (AddButton) {
          AddButton.onclick = () => {
            void onAddButtonClick(args)
          }
        }
        if (AssignButton) {
          AssignButton.onclick = () => {
            void onAssignButtonClick(args)
          }
        }
        if (CancelButton) {
          CancelButton.onclick = () => {
            void onCancelButtonClick(args)
          }
        }
        // TODO: remove in production
        if (DeleteButton) {
          DeleteButton.onclick = () => {
            void onDeleteButtonClick(args)
          }
        }
      }, 100)
    }
  }

  const onAddButtonClick = async (args: any): Promise<void> => {
    const patientId = args.element.querySelector('#PatientId').value
    const doctorId = args.element.querySelector('#DoctorId').value
    const startTime = args.element.querySelector('#StartTime').ej2_instances[0].value
    const endTime = args.element.querySelector('#EndTime').ej2_instances[0].value
    const approvedByPatient = args.element.querySelector('#ApprovedByPatient').checked
    const visited = args.element.querySelector('#Visited').checked

    await errorHandler(async () => {
      const appointmentId = await Appointment.create({
        patient_id: parseInt(patientId),
        doctor_id: parseInt(doctorId),
        start_time: startTime,
        end_time: endTime
      }, session)
      scheduleObj.current?.addEvent({
        Id: String(appointmentId),
        PatientId: patientId,
        DoctorId: doctorId,
        StartTime: startTime,
        EndTime: endTime,
        ApprovedByPatient: approvedByPatient,
        Visited: visited,
        Subject: String('Appointment Id: ' + appointmentId)
      })
      scheduleObj.current?.eventWindow.dialogClose()
    }, colorScheme)
  }

  const onDeleteButtonClick = async (args: any) => {
    const appointmentId = args.element.querySelector('#Id').value
    await errorHandler(async () => {
      await Appointment.deleteById(parseInt(appointmentId), session)
      scheduleObj.current?.deleteEvent(args.element.querySelector('#Id').value)
      scheduleObj.current?.eventWindow.dialogClose()
    }, colorScheme)
  }

  const onAssignButtonClick = async (args: any): Promise<void> => {
    const id = args.element.querySelector('#Id').value
    const patientId = args.element.querySelector('#PatientId').value
    const doctorId = args.element.querySelector('#DoctorId').value
    const startTime = args.element.querySelector('#StartTime').ej2_instances[0].value
    const endTime = args.element.querySelector('#EndTime').ej2_instances[0].value
    const approvedByPatient = args.element.querySelector('#ApprovedByPatient').checked
    const visited = args.element.querySelector('#Visited').checked

    await errorHandler(async () => {
      const responsePatientId = await Appointment.assignPatient(
        parseInt(id),
        {
          patient_id: parseInt(patientId)
        }, session)

      scheduleObj.current?.deleteEvent(args.element.querySelector('#Id').value)
      scheduleObj.current?.addEvent({
        Id: String(id),
        PatientId: responsePatientId,
        DoctorId: doctorId,
        StartTime: startTime,
        EndTime: endTime,
        ApprovedByPatient: approvedByPatient,
        Visited: visited,
        Subject: String('Appointment Id: ' + id)
      })
      scheduleObj.current?.eventWindow.dialogClose()
    }, colorScheme)
  }

  const onCancelButtonClick = async (args: any): Promise<void> => {
    const id = args.element.querySelector('#Id').value
    const doctorId = args.element.querySelector('#DoctorId').value
    const startTime = args.element.querySelector('#StartTime').ej2_instances[0].value
    const endTime = args.element.querySelector('#EndTime').ej2_instances[0].value
    const approvedByPatient = args.element.querySelector('#ApprovedByPatient').checked
    const visited = args.element.querySelector('#Visited').checked

    await errorHandler(async () => {
      const appointmentId = await Appointment.cancelAppointment(parseInt(id), session)
      scheduleObj.current?.deleteEvent(args.element.querySelector('#Id').value)
      scheduleObj.current?.addEvent({
        Id: String(appointmentId),
        DoctorId: doctorId,
        StartTime: startTime,
        EndTime: endTime,
        ApprovedByPatient: approvedByPatient,
        Visited: visited,
        Subject: String('Appointment Id: ' + appointmentId)
      })
      scheduleObj.current?.eventWindow.dialogClose()
    }, colorScheme)
  }

  const editorTemplate = (props: any) => {
    return (props !== undefined
      ? <table className="custom-event-editor" style={{
        width: '100%',
        padding: '5'
      }}>
        <tbody>
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
              style={{width: '100%'}}
            />
          </td>
        </tr>
        <tr>
          <td className="e-textlabel">Patient Id</td>
          <td colSpan={4}>
            <input id="PatientId" className="e-field e-input" type="text" name="PatientId"
                   defaultValue={props.PatientId ?? ''} style={{width: '100%'}}/>
          </td>
        </tr>
        <tr>
          <td className="e-textlabel">Doctor Id</td>
          <td colSpan={4}>
            <input id="DoctorId" className="e-field e-input" type="text" name="DoctorId"
                   defaultValue={props.DoctorId ?? ''} style={{width: '100%'}}/>
          </td>
        </tr>
        <tr>
          <td className="e-textlabel">Start time</td>
          <td colSpan={4}>
            <DateTimePickerComponent format="dd/MM/yy HH:mm" id="StartTime" data-name="StartTime"
                                     value={new Date(props.startTime || props.StartTime)}
                                     className="e-field"></DateTimePickerComponent>
          </td>
        </tr>
        <tr>
          <td className="e-textlabel">End time</td>
          <td colSpan={4}>
            <DateTimePickerComponent format="dd/MM/yy HH:mm" id="EndTime" data-name="EndTime"
                                     value={new Date(props.endTime || props.EndTime)}
                                     className="e-field"></DateTimePickerComponent>
          </td>
        </tr>
        <tr>
          <td className="e-textlabel">Approved By Patient</td>
          <td colSpan={4}>
            <input
              id="ApprovedByPatient"
              type="checkbox"
              defaultChecked={props.ApprovedByPatient}
              className="e-field e-checkbox"
              style={{width: 'auto'}}
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
              style={{width: 'auto'}}
            />
          </td>
        </tr>
        </tbody>
      </table>
      : <div></div>)
  }

  const editorFooterTemplate = (props: any) => {
    return (
      <div id="event-footer" style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        {props && props.Id && (props.PatientId == undefined || !props.PatientId || props.PatientId == '' || props.PatientId == 'undefined') ? (
          <>
            <div id="right-button">
              <button id="Assign" className="e-control e-btn e-primary" data-ripple="true"
                      style={{
                        fontSize: '16px',
                        padding: '10px 20px',
                        textTransform: 'none'
                      }}>
                Assign Patient
              </button>
            </div>
            <div id="right-button">
              <button id="Delete" className="e-control e-btn e-primary" data-ripple="true"
                      style={{
                        fontSize: '16px',
                        padding: '10px 20px',
                        textTransform: 'none'
                      }}>
                Delete
              </button>
            </div>
          </>
        ) : props && props.Id ? (
          <>
            <div id="right-button">
              <button id="Cancel" className="e-control e-btn e-primary" data-ripple="true"
                      style={{
                        fontSize: '16px',
                        padding: '10px 20px',
                        textTransform: 'none'
                      }}>
                Cancel Appointment
              </button>
            </div>
            <div id="right-button">
              <button id="Delete" className="e-control e-btn e-primary" data-ripple="true"
                      style={{
                        fontSize: '16px',
                        padding: '10px 20px',
                        textTransform: 'none'
                      }}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <div id="right-button">
            <button id="Add" className="e-control e-btn e-primary" data-ripple="true"
                    style={{
                      fontSize: '16px',
                      padding: '10px 20px',
                      textTransform: 'none'
                    }}>
              Add
            </button>
          </div>
        )}
      </div>
    );
  }

  const editorHeaderTemplate = (props: any) => {
    return (
      <div id="event-header">
        {(props !== undefined)
          ? ((props.Id) ? <div>Appointment Details</div> : <div>Create New Appointment</div>)
          : <div></div>}
      </div>
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      await errorHandler(async () => {
        const {items: appointments} = await Appointment.get({}, session)
        setAppointments(appointments)
      }, colorScheme, fetchData)
    }
    void fetchData()
  }, [session])

  return (
    <ScheduleComponent width="100%" height="700px" currentView="Month" ref={scheduleObj}
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
        <ViewDirective option="Day"/>
        <ViewDirective option="Week"/>
        <ViewDirective option="Month"/>
        <ViewDirective option="Year"/>
        <ViewDirective option="Agenda"/>
      </ViewsDirective>
      <Inject services={[Day, Week, Month, Year, Agenda]}/>
    </ScheduleComponent>
  )
}

export default MyScheduler
