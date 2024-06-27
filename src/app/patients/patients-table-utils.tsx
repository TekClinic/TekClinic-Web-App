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
import { staleTimeForRefetch } from './const'
import type React from 'react'
import { type Session } from 'next-auth'
import { Patient } from '@/src/api/model/patient'

const fetchEndpointData = async (
  limit: number,
  skip: number,
  session: Session,
  setRowCount: React.Dispatch<React.SetStateAction<number>>
): Promise<Patient[]> => {
  const { items: patients, count } = await Patient.get({ limit, skip }, session)
  setRowCount(count)
  return patients
}

interface UseGetPatientsParams {
  session: Session
  pagination: MRT_PaginationState
  setRowCount: React.Dispatch<React.SetStateAction<number>>
}

export function useGetPatients ({ session, pagination, setRowCount }: UseGetPatientsParams): UseQueryResult<Patient[], Error> {
  return useQuery<Patient[]>({
    queryKey: ['patients', pagination.pageSize, pagination.pageIndex],
    queryFn: async () => await fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize, session, setRowCount),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // keep previous data while fetching new data
    staleTime: staleTimeForRefetch // refetch if its been 45 seconds since last fetch of this page
  })
}

// CREATE hook (post new user to api)
export function useCreatePatient (): UseMutationResult<void, Error, Patient, void> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patient: Patient) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // fake api call
      await Promise.resolve()
    },
    // client side optimistic update
    onMutate: (newPatientInfo: Patient) => {
      queryClient.setQueryData(
        ['patients'],
        (prevPatients: any) =>
          [
            ...prevPatients,
            {
              ...newPatientInfo,
              id: (Math.random() * 1000 + 1)
            }
          ] as Patient[]
      )
    }
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })
}

// UPDATE hook (put user in api)
export function useUpdatePatient (): UseMutationResult<void, Error, Patient, void> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patient: Patient) => {
      // send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // fake api call
      await Promise.resolve()
    },
    // client side optimistic update
    onMutate: (newPatientInfo: Patient) => {
      queryClient.setQueryData(['patients'], (prevPatients: any) =>
        prevPatients?.map((prevPatient: Patient) =>
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
        prevPatients?.filter((patient: Patient) => patient.id !== patientId)
      )
    }
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })
}

const validateRequired = (value: string): boolean => !(value.length === 0)

export function validatePatient (patient: Patient): { name: string } {
  return {
    name: !validateRequired(patient.name)
      ? 'Name is Required'
      : ''
  }
}
