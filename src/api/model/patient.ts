import {
  type EmergencyContact,
  type Gender, type IdHolder,
  type PatientBaseScheme,
  type PatientScheme, type PatientUpdateScheme,
  type PersonalId
} from '@/src/api/scheme'
import {
  createAPIResource,
  deleteAPIResource,
  formatPaginationParams,
  getAPIResource,
  getAPIResourceList,
  type PaginationParams, type PaginationResult, putAPIResource, toE164
} from '@/src/api/common'
import { type Session } from 'next-auth'
import { format } from 'date-fns'

// Patient query parameters.
interface PatientParams extends PaginationParams {
  search?: string
}

// Represents a patient from the API.
export class Patient {
  static __name__ = 'patients'

  readonly id: number
  active: boolean
  readonly age: number
  name: string
  personal_id: PersonalId
  gender: Gender
  phone_number?: string
  languages: string[]
  birth_date: Date
  emergency_contacts: EmergencyContact[]
  referred_by?: string
  special_note?: string

  constructor (scheme: PatientScheme) {
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

  static fromScheme (
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
  ): Promise<PaginationResult<Patient>> => {
    const formattedParams = formatPaginationParams(params)
    if (params.search != null && params.search !== '') {
      formattedParams.search = params.search
    }
    return await getAPIResourceList(Patient, formattedParams, session)
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
    const data = {
      ...props,
      birth_date: format(props.birth_date, 'yyyy-MM-dd')
    }
    if (data.phone_number != null) {
      data.phone_number = toE164(data.phone_number)
    }
    if (data.emergency_contacts != null) {
      data.emergency_contacts = data.emergency_contacts.map((contact) => ({
        ...contact,
        phone: toE164(contact.phone)
      }))
    }
    return await createAPIResource<PatientBaseScheme>(
      Patient,
      data,
      session)
  }

  // deleteById deletes an Patient by ID.
  static deleteById = async (
    id: number,
    session: Session
  ): Promise<void> => {
    await deleteAPIResource(Patient, id, session)
  }

  // delete deletes the Patient.
  delete = async (
    session: Session
  ): Promise<void> => {
    await Patient.deleteById(this.id, session)
  }

  // update updates the Patient.
  update = async (
    session: Session
  ): Promise<void> => {
    const data: PatientUpdateScheme = {
      active: this.active,
      name: this.name,
      personal_id: this.personal_id,
      gender: this.gender,
      phone_number: this.phone_number != null ? toE164(this.phone_number) : undefined,
      languages: this.languages,
      birth_date: format(this.birth_date, 'yyyy-MM-dd'),
      emergency_contacts: this.emergency_contacts.map((contact) => ({
        ...contact,
        phone: toE164(contact.phone)
      })),
      referred_by: this.referred_by,
      special_note: this.special_note
    }
    await putAPIResource<IdHolder, PatientUpdateScheme>(Patient, this.id, data, session)
  }
}
