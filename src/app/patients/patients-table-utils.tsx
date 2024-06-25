'use client'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css' // if using mantine date picker features
import 'mantine-react-table/styles.css' // make sure MRT styles were imported in your app root (once)
import {
  type MRT_PaginationState
} from 'mantine-react-table'
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData, type UseQueryResult, type UseMutationResult
} from '@tanstack/react-query'
import { type PatientResponse, fetchEndpointResponse, fetchPatientList } from '@/src/api/apiCalls'
import { staleTimeForRefetch } from './const'
import type React from 'react'
import { type Session } from 'next-auth'

const fetchEndpointData = async (
  limit: number,
  offset: number,
  session: Session,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setRowCount: React.Dispatch<React.SetStateAction<number>>): Promise<PatientResponse[]> => {
  try {
    const patientEndpointData = await fetchEndpointResponse('patient', limit, offset, session, setError)

    try {
      const patientList = await fetchPatientList(patientEndpointData.results, session, setError)
      setRowCount(patientEndpointData.count)
      return patientList
    } catch (error) {
      console.error('Error occurred:', error)
      return await new Promise((resolve) => [])
    }
  } catch (error) {
    console.error('Error occurred:', error)
    return await new Promise((resolve) => [])
  }
}

interface UseGetPatientsParams {
  session: Session
  setError: React.Dispatch<React.SetStateAction<string | null>>
  pagination: MRT_PaginationState
  setRowCount: React.Dispatch<React.SetStateAction<number>>
}

export function useGetPatients ({ session, setError, pagination, setRowCount }: UseGetPatientsParams): UseQueryResult<PatientResponse[], Error> {
  return useQuery<PatientResponse[]>({
    queryKey: ['patients', pagination.pageSize, pagination.pageIndex],
    queryFn: async () => await fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize, session, setError, setRowCount),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // keep previous data while fetching new data
    staleTime: staleTimeForRefetch // refetch if its been 45 seconds since last fetch of this page
  })
}

// CREATE hook (post new user to api)
export function useCreatePatient (): UseMutationResult<void, Error, PatientResponse, void> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patient: PatientResponse) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // fake api call
      await Promise.resolve()
    },
    // client side optimistic update
    onMutate: (newPatientInfo: PatientResponse) => {
      queryClient.setQueryData(
        ['patients'],
        (prevPatients: any) =>
          [
            ...prevPatients,
            {
              ...newPatientInfo,
              id: (Math.random() * 1000 + 1)
            }
          ] as PatientResponse[]
      )
    }
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })
}

// UPDATE hook (put user in api)
export function useUpdatePatient (): UseMutationResult<void, Error, PatientResponse, void> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patient: PatientResponse) => {
      // send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // fake api call
      await Promise.resolve()
    },
    // client side optimistic update
    onMutate: (newPatientInfo: PatientResponse) => {
      queryClient.setQueryData(['patients'], (prevPatients: any) =>
        prevPatients?.map((prevPatient: PatientResponse) =>
          prevPatient.id === newPatientInfo.id ? newPatientInfo : prevPatient
        )
      )
    }
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })
}

// DELETE hook (delete user in api)
export function useDeletePatient (): UseMutationResult<void, Error, number, void> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patientId: number) => {
      // send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // fake api call
      await Promise.resolve()
    },
    // client side optimistic update
    onMutate: (patientId: number) => {
      queryClient.setQueryData(['patients'], (prevPatients: any) =>
        prevPatients?.filter((patient: PatientResponse) => patient.id !== patientId)
      )
    }
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })
}

const validateRequired = (value: string): boolean => !(value.length === 0)

export function validatePatient (patient: PatientResponse): { name: string } {
  return {
    name: !validateRequired(patient.name)
      ? 'Name is Required'
      : ''
  }
}
