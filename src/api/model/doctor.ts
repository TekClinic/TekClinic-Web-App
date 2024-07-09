import { type DoctorScheme, type Gender } from '@/src/api/scheme'
import {
  formatPaginationParams,
  getAPIResource,
  getAPIResourceList,
  type PaginationParams,
  type PaginationResult
} from '@/src/api/common'
import { type Session } from 'next-auth'

// Doctor query parameters.
interface DoctorParams extends PaginationParams {
}

// Represents a doctor from the API.
export class Doctor {
  static __name__ = 'doctor'

  readonly id: number
  readonly active: boolean
  readonly name: string
  readonly gender: Gender
  readonly phone_number: string
  readonly specialities: string[]
  readonly special_note?: string

  constructor (scheme: DoctorScheme) {
    this.id = scheme.id
    this.active = scheme.active
    this.name = scheme.name
    this.gender = scheme.gender
    this.phone_number = scheme.phone_number
    this.specialities = scheme.specialities
    this.special_note = scheme.special_note
  }

  static fromScheme (
    scheme: DoctorScheme
  ): Doctor {
    return new Doctor(scheme)
  }

  // getById fetches a single doctor by ID.
  static getById = async (
    id: number,
    session: Session
  ): Promise<Doctor> => {
    return await getAPIResource(Doctor, id, session)
  }

  // get fetches a list of doctors according to the query parameters.
  static get = async (
    params: DoctorParams,
    session: Session
  ): Promise<PaginationResult<Doctor>> => {
    return await getAPIResourceList(Doctor, formatPaginationParams(params), session)
  }
}
