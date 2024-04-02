'use client'
import MyApp from './MyApp'
import AuthContextProvider from './context/AuthContextProvider'
import { MantineProvider } from '@mantine/core'
import { registerLicense } from '@syncfusion/ej2-base'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-react-table/styles.css'
import React from 'react'

const syncfusionLicenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY
if (syncfusionLicenseKey == null) {
  throw new Error('NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY is not set. ' +
        'You probably forgot to set it in your .env.local file.')
}
registerLicense(syncfusionLicenseKey)

function App (): React.JSX.Element {
  return (
        <AuthContextProvider>
            <MantineProvider>
                <MyApp/>
            </MantineProvider>
        </AuthContextProvider>
  )
}

export default App
