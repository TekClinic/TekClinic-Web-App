import React from 'react'
import styles from './general.module.css' // Import CSS module for styling
import MyScheduler from '../components/Calendar'

const AppointmentsPage = (): React.JSX.Element => {
  return (

    <div className={styles.container} style={{ height: '100%', overflow: 'auto' }}>
      <h1></h1>
      <h1 className={styles.heading}>Appointments</h1>
      <MyScheduler />
    </div>
  )
}

export default AppointmentsPage
