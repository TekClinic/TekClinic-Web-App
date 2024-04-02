import React, { useContext } from 'react';
import { AuthContext } from "../context/AuthContextProvider";
import { useEffect, useState } from "react";
import { DoctorResponse, EndpointResponse, fetchEndpointResponse, fetchDoctorList } from "../apiCalls";
import DoctorTable, { generateDoctorRows } from '../components/DoctorTable';
import styles from './general.module.css'; // Import CSS module for styling
import { Pagination, Group } from '@mantine/core';


const VolunteersDoctorsPage = () => {
  const authContext = useContext(AuthContext);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [doctorEndpointResponse, setDoctorEndpointResponse] = useState<EndpointResponse | null>(null);
  const [doctorList, setDoctorList] = useState<DoctorResponse[]>([]);

  const [count, setCount] = useState(1);
  const [activePage, setCurrentPage] = useState(1);
  //console.log(authContext.keycloakToken);
  const defaultLimit = 20;
  const defaultOffset = 0;

  let defaultCount = 1;

  const fetchEndpointData = async (limit: number, offset: number) => {
    try {
      const doctorEndpointData = await fetchEndpointResponse("doctor", limit, offset, authContext, setError);
      //console.log(doctorEndpointData);
      setDoctorEndpointResponse(doctorEndpointData);

      defaultCount = Math.ceil(doctorEndpointData.count / defaultLimit);

      const fetchDoctorListData = async () => {
        try {
          const doctorListData = await fetchDoctorList(doctorEndpointData.results, authContext, setError);
          //console.log(doctorListData);
          setDoctorList(doctorListData);
        } catch (error) {
          console.error('Error occurred:', error);
          console.error('Logging out...', error);
          authContext.logout();
        }
      };
      fetchDoctorListData();

    } catch (error) {
      console.error('Error occurred:', error);
      console.error('Logging out...', error);
      authContext.logout();
    }
  };
  const setPage = (newPage: number) => {
    //console.log("setting next page...");
    if (doctorEndpointResponse) {
      const new_offset = defaultOffset + (newPage - 1) * defaultLimit;
      fetchEndpointData(defaultLimit, new_offset);
    }
    setCurrentPage(newPage);
  };

  useEffect(() => {
    if (authContext.isAuthenticated && authContext.keycloakToken && authContext.username) {
      setUsername(authContext.username);
    }
    setCount(defaultCount);
    if (doctorEndpointResponse == null) {
      fetchEndpointData(defaultLimit, defaultOffset).then(() => {
        // After fetchEndpointData completes, update the count
        setCount(defaultCount);
      });
    }
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username]);

  const rows = doctorList ? generateDoctorRows(doctorList) : null;
  return (
    rows ? (
      <div className={styles.container} >
        <h1>Doctors</h1>
        <DoctorTable rows={rows} />
        <div > {/* Adjust the height as needed */}
          <Pagination.Root total={count} value={activePage} onChange={setPage}>
            <Group gap={5} justify="center">
              <Pagination.First />
              <Pagination.Previous />
              <Pagination.Items />
              <Pagination.Next />
              <Pagination.Last />
            </Group>
          </Pagination.Root>
        </div>
      </div>
    ) : (
      <div>
      <div className={styles.container} >
        <h1>Volunteers and Doctors</h1>
      </div>
      </div>
    )
  );
};

export default VolunteersDoctorsPage;
