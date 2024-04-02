import React from 'react'
import Image from 'next/image'

export default function Home (): React.JSX.Element {
  return (
    <div style={{ marginTop: '50px' }}>
      <center>
        <table>
          <tbody>
          <tr>
            <td><h1 className="main_header">Your clinic organizer</h1>
            <h3 className='main_description'>Manage your patients, doctors, <br /> and appointments</h3>
            </td>
            <td> <Image src="./clinic_intro.png" style={{ tabSize: '10px' }} alt="clinic intro" />  </td>
          </tr>
          </tbody>
      </table>
    </center>
    </div>
  )
}
