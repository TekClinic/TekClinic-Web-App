'use client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import {
  MRT_PaginationState,
} from 'mantine-react-table';
import { AuthContextValues } from "../context/AuthContextProvider";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData
} from '@tanstack/react-query';
import { PatientResponse , fetchEndpointResponse, fetchPatientList } from "../apiCalls";
import { staleTimeForRefetch } from './consts';


const fetchEndpointData = async (
    limit: number,
    offset: number,
    authContext: AuthContextValues,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setRowCount: React.Dispatch<React.SetStateAction<number>>): Promise<PatientResponse[]> => {
    try {
      const patientEndpointData = await fetchEndpointResponse("patient", limit, offset, authContext, setError);
  
      try {
        const patientList = await fetchPatientList(patientEndpointData.results, authContext, setError);
        setRowCount(patientEndpointData.count);
        return patientList;
  
      } catch (error) {
        console.error('Error occurred:', error);
        return new Promise((resolve) => []);
      }
  
    } catch (error) {
      console.error('Error occurred:', error);
      return new Promise((resolve) => []);
    }
  };
  
  
  interface UseGetPatientsParams {
    authContext: AuthContextValues,
    setError: React.Dispatch<React.SetStateAction<string | null>>
    pagination: MRT_PaginationState
    setRowCount: React.Dispatch<React.SetStateAction<number>>
  }
  
  export function useGetPatients({ authContext, setError, pagination, setRowCount }: UseGetPatientsParams) {
    return useQuery<PatientResponse[]>({
      queryKey: ['patients', pagination.pageSize, pagination.pageIndex],
      queryFn: () => fetchEndpointData(pagination.pageSize, pagination.pageIndex * pagination.pageSize, authContext, setError, setRowCount),
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData, // keep previous data while fetching new data
      staleTime: staleTimeForRefetch, // refetch if its been 45 seconds since last fetch of this page
    });
  }
  