'use client'

import React from 'react'
import Image from 'next/image'
import clinicIntro from '@/public/clinic_intro.png'
import { Title, useMantineTheme, useComputedColorScheme } from '@mantine/core'

export default function Home (): React.JSX.Element {
  const theme = useMantineTheme()
  const computedColorScheme = useComputedColorScheme()

  return (
    <div style={{ marginTop: '50px' }}>
      <center>
        <table>
          <tbody>
          <tr>
            <td><Title order={1} style= {{ color: computedColorScheme === 'light' ? theme.colors.blue[9] : theme.colors.white[0], fontWeight: 800 }}>Your Clinic Organizer!</Title>
            <Title order={3} style= {{ color: computedColorScheme === 'light' ? theme.colors.blue[6] : theme.colors.white[0], fontWeight: 300 }}>Manage your patients, doctors, <br /> and appointments</Title>
            </td>
            <td> <Image quality={100} src={clinicIntro} style={{ tabSize: '10px' }} alt="clinic intro" />  </td>
          </tr>
          </tbody>
      </table>
    </center>
    </div>
  )
}
