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
    <div style={{ marginTop: '50px' }}>
      <center>
        <table>
          <tr>
            <td><h1 className="main_header">Your clinic organizer</h1>
            <h3 className='main_description'>Manage your patients, doctors, <br /> and appointments</h3>
            </td>
            <td> <img src="./clinic_intro.png" style={{tabSize: '10px'}} alt="clinic intro" />  </td>
          </tr>
      </table>
    </center>
    </div>
  );
}
