import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContextProvider'

export default function Home () {
  const authContext = useContext(AuthContext)
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    if (authContext.isAuthenticated && authContext.keycloakToken && authContext.username) {
      setUsername(authContext.username)
    }
  }, [authContext.isAuthenticated, authContext.keycloakToken, authContext.username])

  return (
        <div>Hi!</div>
        // <div className={styles.container}>
        //   <center>
        //   <Title>Hello, {username}</Title>
        //   <br />
        //   <Button onClick={authContext.logout}>Logout</Button>
        //   </center>
        // </div>
  )
}
