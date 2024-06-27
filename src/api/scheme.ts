// Definition of the data scheme according to the API

export interface NamedAPIResourceList {
  count: number
  next: null | string
  previous: null | string
  results: NamedAPIResource[]
}

export interface NamedAPIResource {
  name: string
  url: string
}

export interface PatientBaseScheme {
  name: string
  personal_id: PersonalId
  gender?: Gender
  phone_number?: string
  languages?: string[]
  birth_date: string
  emergency_contacts?: EmergencyContact[]
  referred_by?: string
  special_note?: string
}

export interface PatientScheme extends PatientBaseScheme {
  id: number
  active: boolean
  age: number
  gender: Gender
  languages: string[]
  emergency_contacts: EmergencyContact[]
}

export interface PersonalId {
  id: string
  type: string
}

export interface EmergencyContact {
  name: string
  closeness: string
  phone: string
}

export interface DoctorScheme {
  id: number
  active: boolean
  name: string
  gender: Gender
  phone_number: string
  specialities: string[]
  special_note?: string
}

export interface AppointmentBaseScheme {
  patient_id?: number
  doctor_id: number
  start_time: string
  end_time: string
}

export interface AppointmentScheme extends AppointmentBaseScheme {
  id: number
  approved_by_patient: boolean
  visited: boolean
}

export interface IdHolder {
  id: number
}

export interface PatientIdHolder {
  patient_id: number
}

export type Gender = 'unspecified' | 'male' | 'female'
