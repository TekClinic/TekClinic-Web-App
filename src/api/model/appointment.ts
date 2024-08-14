import { type AppointmentBaseScheme, type AppointmentScheme, type PatientIdHolder } from '@/src/api/scheme'
import {
  clearAPIResourceField,
  createAPIResource,
  deleteAPIResource,
  formatPaginationParams,
  getAPIResource,
  getAPIResourceList,
  type PaginationParams, type PaginationResult,
  putAPIResourceField
} from '@/src/api/common'
import { type Session } from 'next-auth'
import { format } from 'date-fns'
import { Doctor } from '@/src/api/model/doctor'
import { Patient } from '@/src/api/model/patient'

// Appointment query parameters.
interface AppointmentParams extends PaginationParams {
  date?: Date
  doctor_id?: number
  patient_id?: number
}

// Represents an appointment from the API.
export class Appointment {
  static __name__ = 'appointments'

  readonly id: number
  readonly patient_id?: number
  readonly doctor_id: number
  readonly start_time: Date
  readonly end_time: Date
  readonly approved_by_patient: boolean
  readonly visited: boolean

  private doctor?: Doctor
  private patient?: Patient

  get subject (): string {
    return this.getSubject()
  }

  getSubject = (): string => {
    const doctorName = this.doctor?.name ?? this.doctor_id
    const patientName = this.patient?.name ?? this.patient_id
    if (patientName != null) {
      return `${patientName} visits Dr. ${doctorName}`
    }
    return `Dr. ${doctorName} available`
  }

  loadDoctor = async (
    session: Session
  ): Promise<void> => {
    if (this.doctor_id == null || this.doctor != null) {
      return
    }
    this.doctor = await Doctor.getById(this.doctor_id, session)
  }

  loadPatient = async (
    session: Session
  ): Promise<void> => {
    if (this.patient_id == null || this.patient != null) {
      return
    }
    this.patient = await Patient.getById(this.patient_id, session)
  }

  constructor (scheme: AppointmentScheme) {
    this.id = scheme.id
    this.patient_id = scheme.patient_id
    this.doctor_id = scheme.doctor_id
    this.start_time = new Date(scheme.start_time)
    this.end_time = new Date(scheme.end_time)
    this.approved_by_patient = scheme.approved_by_patient
    this.visited = scheme.visited
  }

  static fromScheme (
    scheme: AppointmentScheme
  ): Appointment {
    return new Appointment(scheme)
  }

  // getById fetches a single appointment by ID.
  static getById = async (
    id: number,
    session: Session
  ): Promise<Appointment> => {
    return await getAPIResource(Appointment, id, session)
  }

  // get fetches a list of appointments according to the query parameters.
  static get = async (
    params: AppointmentParams,
    session: Session
  ): Promise<PaginationResult<Appointment>> => {
    const formattedParams = formatPaginationParams(params)
    if (params.date != null) {
      formattedParams.date = format(params.date, 'yyyy-MM-dd')
    }
    if (params.doctor_id != null) {
      formattedParams.doctor = params.doctor_id.toString()
    }
    if (params.patient_id != null) {
      formattedParams.patient = params.patient_id.toString()
    }
    return await getAPIResourceList(Appointment, formattedParams, session)
  }

  // create creates a new appointment.
  static create = async (
    props: {
      patient_id?: number
      doctor_id: number
      start_time: Date
      end_time: Date
    },
    session: Session
  ): Promise<number> => {
    return await createAPIResource<AppointmentBaseScheme>(
      Appointment,
      {
        ...props,
        start_time: props.start_time.toISOString(),
        end_time: props.end_time.toISOString()
      },
      session)
  }

  // deleteById deletes an appointment by ID.
  static deleteById = async (
    id: number,
    session: Session
  ): Promise<void> => {
    await deleteAPIResource(Appointment, id, session)
  }

  // delete deletes the appointment.
  delete = async (
    session: Session
  ): Promise<void> => {
    await Appointment.deleteById(this.id, session)
  }

  // assignPatient assigns a patient to the appointment.
  static assignPatient = async (
    id: number,
    patient: PatientIdHolder,
    session: Session
  ): Promise<number> => {
    return await putAPIResourceField<PatientIdHolder>(
      Appointment,
      id,
      patient,
      'patient',
      session)
  }

  assignPatient = async (
    patient: PatientIdHolder,
    session: Session
  ): Promise<number> => {
    return await Appointment.assignPatient(
      this.id,
      patient,
      session)
  }

  // clearPatient removes the patient from the appointment.
  clearPatient = async (
    session: Session
  ): Promise<number> => {
    return await Appointment.cancelAppointment(this.id, session)
  }

  // cancelAppointment cancels an appointment for a patient.
  static cancelAppointment = async (
    id: number,
    session: Session
  ): Promise<number> => {
    return await clearAPIResourceField(
      Appointment,
      id,
      'patient',
      session)
  }
}
