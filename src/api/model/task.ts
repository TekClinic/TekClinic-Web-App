import {
  type TaskScheme,
  type TaskBaseScheme,
  type TaskUpdateScheme,
  type IdHolder
} from '@/src/api/scheme'
import {
  createAPIResource,
  deleteAPIResource,
  formatPaginationParams,
  getAPIResource,
  getAPIResourceList,
  putAPIResource,
  toE164,
  type PaginationParams,
  type PaginationResult
} from '@/src/api/common'
import { type Session } from 'next-auth'

/** Task query parameters. */
interface TaskParams extends PaginationParams {
  search?: string
}

export class Task {
  static __name__ = 'tasks'

  readonly id: number
  readonly created_at: Date
  complete: boolean
  patient_id: number
  expertise: string | null
  title: string
  description: string

  constructor (scheme: TaskScheme) {
    this.id = scheme.id
    this.created_at = new Date(scheme.created_at)
    this.complete = scheme.complete
    this.patient_id = scheme.patient_id
    this.expertise = scheme.expertise
    this.title = scheme.title
    this.description = scheme.description
  }

  static fromScheme (scheme: TaskScheme): Task {
    return new Task(scheme)
  }

  static getById = async (id: number, session: Session): Promise<Task> => {
    return await getAPIResource(Task, id, session)
  }

  static get = async (params: TaskParams, session: Session): Promise<PaginationResult<Task>> => {
    const formattedParams = formatPaginationParams(params)
    if (params.search != null && params.search !== '') {
      formattedParams.search = params.search
    }
    return await getAPIResourceList(Task, formattedParams, session)
  }

  static create = async (props: TaskBaseScheme, session: Session): Promise<number> => {
    return await createAPIResource<TaskBaseScheme>(Task, props, session)
  }

  update = async (session: Session) => {
    const data: TaskUpdateScheme = {
      patient_id: this.patient_id,
      expertise: this.expertise,
      title: this.title,
      description: this.description
    }
    await putAPIResource<IdHolder, TaskUpdateScheme>(Task, this.id, data, session)
  }
}
