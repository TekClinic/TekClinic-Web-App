import { type DoctorBaseScheme, type DoctorScheme, type Gender } from '@/src/api/scheme'
import {
  createAPIResource,
  deleteAPIResource,
  formatPaginationParams,
  getAPIResource,
  getAPIResourceList,
  type PaginationParams,
  type PaginationResult, toE164
} from '@/src/api/common'
import { type Session } from 'next-auth'

// Doctor query parameters.
interface DoctorParams extends PaginationParams {
  search?: string
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
    const formattedParams = formatPaginationParams(params)
    if (params.search != null && params.search !== '') {
      formattedParams.search = params.search
    }
    return await getAPIResourceList(Doctor, formattedParams, session)
  }

  // create creates a new doctor.
  static create = async (
    props: {
      name: string
      gender?: Gender
      phone_number: string
      specialities?: string[]
      special_note?: string
    },
    session: Session
  ): Promise<number> => {
    const data = {
      ...props,
      phone_number: toE164(props.phone_number)
    }
    return await createAPIResource<DoctorBaseScheme>(
      Doctor,
      data,
      session)
  }

  // deleteById deletes an Doctor by ID.
  static deleteById = async (
    id: number,
    session: Session
  ): Promise<void> => {
    await deleteAPIResource(Doctor, id, session)
  }

  // delete deletes the Doctor.
  delete = async (
    session: Session
  ): Promise<void> => {
    await Doctor.deleteById(this.id, session)
  }
}
