import React, { useContext } from 'react';
import { Title, Button } from '@mantine/core';
import { AuthContext } from "../context/AuthContextProvider";
import { useEffect, useState } from "react";
import styles from './general.module.css'; // Import CSS module for styling



export default function Home() {
  const authContext = useContext(AuthContext);
  const [username, setUsername] = useState<string>("");

  const limit = 20;
  const offset = 0;

  useEffect(() => {
    if (authContext.isAuthenticated && authContext.keycloakToken && authContext.username) {
      setUsername(authContext.username);
    }
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username]);

  return (
    <div className={styles.container}>
      <center>
      <Title>Hello, {username}</Title>
      <br />
      <Button onClick={authContext.logout}>Logout</Button>
      </center>
    </div>
  );
}
