import React, { useContext } from 'react';
import { AuthContext } from "../context/AuthContextProvider";
import { useEffect, useState } from "react";
import {  AppointmentResponse, EndpointResponse, fetchEndpointResponse, fetchAppointmentList  } from "../apiCalls";
import styles from './general.module.css'; // Import CSS module for styling
import MyScheduler from '../components/Calendar';

const AppointmentsPage = () => {
  const authContext = useContext(AuthContext);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [appointmentEndpointResponse, setAppointmentEndpointResponse] = useState<EndpointResponse | null>(null);
  const [appointmentList, setAppointmentList] = useState<AppointmentResponse[]>([]);
  //console.log(authContext.keycloakToken);
  const limit = 20;
  const offset = 0;

  useEffect(() => {
    if (authContext.isAuthenticated && authContext.keycloakToken && authContext.username) {
      setUsername(authContext.username);
    }
    const fetchEndpointData = async () => {
      try {
        const appointmentEndpointData = await fetchEndpointResponse("appointment", limit, offset, authContext, setError);
        console.log(appointmentEndpointData);
        setAppointmentEndpointResponse(appointmentEndpointData);

        const fetchAppointmentListData = async () => {
          try {
            const appointmentListData = await fetchAppointmentList(appointmentEndpointData.results, authContext, setError);
            console.log(appointmentListData);
            setAppointmentList(appointmentListData);
          } catch (error) {
            console.error('Error occurred:', error);
            console.error('Logging out...', error);
            authContext.logout();
          }
        };
        fetchAppointmentListData();

      } catch (error) {
        console.error('Error occurred:', error);
        console.error('Logging out...', error);
        authContext.logout();
      }
    };
    fetchEndpointData();
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username]);


  return (
    
    <div className={styles.container} style={{ height: '100%', overflow: 'auto' }}>
      <h1></h1>
      <h1 className={styles.heading}>Appointments</h1>
      <MyScheduler />
    </div>
  );
};

export default AppointmentsPage;
