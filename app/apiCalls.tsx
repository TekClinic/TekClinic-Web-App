import { AuthContextValues } from "./context/AuthContextProvider"; //I changed AuthContextValues interface to make it exportable
import axios, { AxiosResponse, AxiosError } from 'axios';

//const url = 'http://localhost:8080';
const url = 'http://api.tekclinic.org';

interface Results {
    name: string;
    url: string;
}

export interface EndpointResponse {
    count: number;
    next: string;
    previous: null | string;
    results: Results[];
}
interface PersonalId {
    id: string;
    type: string;
}

interface BirthDate {
    day: number;
    month: number;
    year: number;
}

interface EmergencyContact {
    name: string;
    closeness: string;
    phone: string;
}

export interface PatientResponse {
    id: number;
    active: boolean;
    name: string;
    personal_id: PersonalId;
    gender: string;
    phone_number: string;
    languages: string[];
    birth_date: BirthDate;
    age: number;
    referred_by: string;
    emergency_contacts: EmergencyContact[];
    special_note: string;
}
export interface DoctorResponse {
    id: number;
    active: boolean;
    name: string;
    gender: string;
    phone_number: string;
    specialities: string[];
    special_note: string;
}
export interface AppointmentResponse {
    patient_id: number;
    doctor_id: number;
    date: { year: number; month: number; day: number };
    time: { hour: number; minute: number };
    approved_by_patient: boolean;
    visited: boolean;
}
export function fetchEndpointResponse(endpoint: string, limit: number, offset: number, authContext: AuthContextValues, setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<EndpointResponse> {
    return new Promise((resolve, reject) => {
        if (authContext.isAuthenticated && authContext.keycloakToken) {
            let get_url = `${url}/${endpoint}?limit=${limit}&offset=${offset}`;
            axios.get<EndpointResponse>(get_url, {
                headers: {
                    Authorization: `Bearer ${authContext.keycloakToken}`,
                },
            })
                .then((response: AxiosResponse<EndpointResponse>) => {
                    //console.log(`GET ${endpoint} Response:`, response.data);
                    resolve(response.data); // Resolve the promise with the fetched data
                })
                .catch((error: AxiosError) => {
                    console.error(`Error fetching ${endpoint} data:`, error);
                    if (error.response) {
                        setError(`Error: ${(error.response.status as number)} - ${(error.response.data as { error: string }).error}`);
                    } else if (error.request) {
                        setError('No response received from the server.');
                    } else {
                        setError(`Error: ${error.message}`);
                    }
                    reject(error); // Reject the promise with the error
                });
        } else {
            reject(new Error('User not authenticated')); // Reject the promise if user is not authenticated
            console.log('Logging out...');
            authContext.logout();
        }
    });
}

export function fetchPatientList(patients: Results[], authContext: AuthContextValues, setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<PatientResponse[]> {
    const patientRequests: Promise<PatientResponse>[] = [];

    patients.forEach((patient: Results, index: number) => {
        const requestPromise = axios.get<PatientResponse>(patient.url, {
            headers: {
                Authorization: `Bearer ${authContext.keycloakToken}`,
            },
        })
            .then((response: AxiosResponse<PatientResponse>) => {
                //console.log(`GET patient/${index} Response:`, response.data);
                return response.data;
            })
            .catch((error: AxiosError) => {
                console.error(`Error fetching patient/${index} data:`, error);
                if (error.response) {
                    setError(`Error: ${(error.response.status as number)} - ${(error.response.data as { error: string }).error}`);
                } else if (error.request) {
                    setError('No response received from the server.');
                } else {
                    setError(`Error: ${error.message}`);
                }
                throw error; // Propagate the error
            });

        patientRequests.push(requestPromise);
    });

    return Promise.all(patientRequests);
}
export function fetchDoctorList(doctors: Results[], authContext: AuthContextValues, setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<DoctorResponse[]> {
    const doctorRequests: Promise<DoctorResponse>[] = [];

    doctors.forEach((doctor: Results, index: number) => {
        const requestPromise = axios.get<DoctorResponse>(doctor.url, {
            headers: {
                Authorization: `Bearer ${authContext.keycloakToken}`,
            },
        })
            .then((response: AxiosResponse<DoctorResponse>) => {
                //console.log(`GET doctor/${index} Response:`, response.data);
                return response.data;
            })
            .catch((error: AxiosError) => {
                console.error(`Error fetching doctor/${index} data:`, error);
                if (error.response) {
                    setError(`Error: ${(error.response.status as number)} - ${(error.response.data as { error: string }).error}`);
                } else if (error.request) {
                    setError('No response received from the server.');
                } else {
                    setError(`Error: ${error.message}`);
                }
                throw error; // Propagate the error
            });

        doctorRequests.push(requestPromise);
    });

    return Promise.all(doctorRequests);
}

export function fetchAppointmentList(appointments: Results[], authContext: AuthContextValues, setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<AppointmentResponse[]> {
    const appointmentRequests: Promise<AppointmentResponse>[] = [];

    appointments.forEach((appointment: Results, index: number) => {
        const requestPromise = axios.get<AppointmentResponse>(appointment.url, {
            headers: {
                Authorization: `Bearer ${authContext.keycloakToken}`,
            },
        })
            .then((response: AxiosResponse<AppointmentResponse>) => {
                //console.log(`GET appointment/${index} Response:`, response.data);
                return response.data;
            })
            .catch((error: AxiosError) => {
                console.error(`Error fetching appointment/${index} data:`, error);
                if (error.response) {
                    setError(`Error: ${(error.response.status as number)} - ${(error.response.data as { error: string }).error}`);
                } else if (error.request) {
                    setError('No response received from the server.');
                } else {
                    setError(`Error: ${error.message}`);
                }
                throw error; // Propagate the error
            });

        appointmentRequests.push(requestPromise);
    });

    return Promise.all(appointmentRequests);
}
