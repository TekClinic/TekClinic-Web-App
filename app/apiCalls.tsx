/**
 * 1. Maybe add type checking?
*/
import { AuthContextValues } from "./context/AuthContextProvider"; //I changed AuthContextValues interface to make it exportable
import axios, { AxiosResponse, AxiosError } from 'axios';

//const url = 'http://localhost:8080';
const url = "http://api.tekclinic.org";

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
    start_time: Date;
    end_time: Date;
    approved_by_patient: boolean;
    visited: boolean;
}

export interface Appointment extends AppointmentResponse {
    id: number;
}



export function fetchEndpointResponse(endpoint: string, limit: number, offset: number, authContext: AuthContextValues, setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<EndpointResponse> {
    return new Promise((resolve, reject) => {
        if (authContext.isAuthenticated && authContext.keycloakToken) {
            let get_url = `${url}/${endpoint}?limit=${limit}&skip=${offset}`;
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

export function fetchAppointmentList(
    appointments: Results[], // Replace any[] with a type/interface that represents an appointment
    authContext: AuthContextValues,
    setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<Appointment[]> {
    const appointmentRequests: Promise<Appointment>[] = [];

    appointments.forEach((appointment: Results, index: number) => { // Replace 'any' with the correct type/interface
        // Extract the ID from the appointment URL
        const appointmentId = parseInt(appointment.url.split('/').pop() ?? '', 10);

        const requestPromise = axios.get<AppointmentResponse>(appointment.url, {
            headers: {
                Authorization: `Bearer ${authContext.keycloakToken}`,
            },
        })
            .then((response: AxiosResponse<AppointmentResponse>) => {
                // Assign the ID extracted from the URL to the ID field of the appointment response
                const appointmentData = response.data as Appointment; // Cast to Appointment
                appointmentData.id = appointmentId; // Use the ID from the URL
                return appointmentData;
            })
            .catch((error: AxiosError) => {
                console.error(`Error fetching appointment/${index} data:`, error);
                let errorMessage = 'An error occurred while fetching appointments.';
                if (error.response) {
                    errorMessage = `Error: ${(error.response.status as number)} - ${(error.response.data as { error: string }).error}`;
                } else if (error.request) {
                    errorMessage = 'No response received from the server.';
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
                setError(errorMessage);
                throw error; // Propagate the error
            });

        appointmentRequests.push(requestPromise);
    });

    return Promise.all(appointmentRequests);
}

export interface CreateAppointmentRequest {
    patient_id?: number;
    doctor_id: number;
    start_time: string;
    end_time: string;
}

export interface CreateAppointmentResponse {
    id: {
        id: number;
    };
}

export function createAppointment(
    appointmentData: CreateAppointmentRequest,
    authContext: AuthContextValues,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ): Promise<CreateAppointmentResponse> {
    return new Promise((resolve, reject) => {
      if (authContext.isAuthenticated && authContext.keycloakToken) {
        axios.post(`${url}/appointment`, appointmentData, {
          headers: {
            Authorization: `Bearer ${authContext.keycloakToken}`,
          },
        })
          .then((response: AxiosResponse<{ id: number }>) => {
            const appointmentResponse: CreateAppointmentResponse = {
              id: {
                id: response.data.id
              }
            };
            resolve(appointmentResponse);
          })
          .catch((error: AxiosError) => {
            console.error('Error creating appointment:', error);
            if (error.response) {
              setError(`Error: ${(error.response.status as number)} - ${(error.response.data as { error: string }).error}`);
            } else if (error.request) {
              setError('No response received from the server.');
            } else {
              setError(`Error: ${error.message}`);
            }
            reject(error);
          });
      } else {
        reject(new Error('User not authenticated'));
        console.log('Logging out...');
        authContext.logout();
      }
    });
  }

export function deleteAppointment(
    appointmentId: number,
    authContext: AuthContextValues,
    setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (authContext.isAuthenticated && authContext.keycloakToken) {
            axios.delete<void>(`${url}/appointment/${appointmentId}`, {
                headers: {
                    Authorization: `Bearer ${authContext.keycloakToken}`,
                },
            })
            .then(() => {
                console.log(`Appointment with ID ${appointmentId} deleted successfully`);
                resolve();
            })
            .catch((error: AxiosError) => {
                console.error(`Error deleting appointment with ID ${appointmentId}:`, error);
                if (error.response) {
                    setError(`Error: ${(error.response.status as number)} - ${(error.response.data as { error: string }).error}`);
                } else if (error.request) {
                    setError('No response received from the server.');
                } else {
                    setError(`Error: ${error.message}`);
                }
                reject(error);
            });
        } else {
            reject(new Error('User not authenticated'));
            console.log('Logging out...');
            authContext.logout();
        }
    });
}
