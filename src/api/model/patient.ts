import {
  type EmergencyContact,
  type Gender,
  type PatientBaseScheme,
  type PatientScheme,
  type PersonalId
} from '@/src/api/scheme'
import {
  createAPIResource,
  deleteAPIResource,
  formatPaginationParams,
  getAPIResource,
  getAPIResourceList,
  type PaginationParams
} from '@/src/api/common'
import { type Session } from 'next-auth'
import { format } from 'date-fns'

// Patient query parameters.
interface PatientParams extends PaginationParams {
}

// Represents a patient from the API.
export class Patient {
  static __name__ = 'patient'

  readonly id: number
  readonly active: boolean
  readonly age: number
  readonly name: string
  readonly personal_id: PersonalId
  readonly gender: Gender
  readonly phone_number?: string
  readonly languages: string[]
  readonly birth_date: Date
  readonly emergency_contacts: EmergencyContact[]
  readonly referred_by?: string
  readonly special_note?: string

  constructor(scheme: PatientScheme) {
    this.id = scheme.id
    this.active = scheme.active
    this.age = scheme.age
    this.name = scheme.name
    this.personal_id = scheme.personal_id
    this.gender = scheme.gender
    this.phone_number = scheme.phone_number
    this.languages = scheme.languages
    this.birth_date = new Date(scheme.birth_date)
    this.emergency_contacts = scheme.emergency_contacts
    this.referred_by = scheme.referred_by
    this.special_note = scheme.special_note
  }

  static fromScheme(
    scheme: PatientScheme
  ): Patient {
    return new Patient(scheme)
  }

  // getById fetches a single patient by ID.
  static getById = async (
    id: number,
    session: Session
  ): Promise<Patient> => {
    return await getAPIResource(Patient, id, session)
  }

  // get fetches a list of patients according to the query parameters.
  static get = async (
    params: PatientParams,
    session: Session
  ): Promise<{
    items: Patient[]
    count: number
  }> => {
    return await getAPIResourceList(Patient, formatPaginationParams(params), session)
  }

  // create creates a new patient.
  static create = async (
    props: {
      name: string
      personal_id: PersonalId
      gender?: Gender
      phone_number?: string
      languages?: string[]
      birth_date: Date
      emergency_contacts?: EmergencyContact[]
      referred_by?: string
      special_note?: string
    },
    session: Session
  ): Promise<number> => {
    return await createAPIResource<PatientBaseScheme>(
      Patient,
      {
        ...props,
        birth_date: format(props.birth_date, 'yyyy-MM-dd')
      },
      session)
  }

  // deleteById deletes an Patient by ID.
  static deleteById = async (
    id: number,
    session: Session
  ): Promise<void> => {
    throw new Error('Not implemented')
    //await deleteAPIResource(Patient, id, session)
  }

  // delete deletes the Patient.
  delete = async (
    session: Session
  ): Promise<void> => {
    await Patient.deleteById(this.id, session)
  }
}

