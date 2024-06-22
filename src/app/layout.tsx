'use client'
import '@mantine/core/styles.css'
import React, { useContext } from 'react'
import { AppShell, Center, ColorSchemeScript, createTheme, Loader, MantineProvider } from '@mantine/core'
import AuthContextProvider, { AuthContext } from '@/src/context/AuthContextProvider'
import { useDisclosure } from '@mantine/hooks'
import Header from '@/src/components/Header'
import Navbar from '@/src/components/Navbar'
import { registerLicense } from '@syncfusion/ej2-base'
import { requireBuildEnv } from '@/src/api/utils'

registerLicense(requireBuildEnv('NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY', process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY))

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'blue'
})

function ContentLayout ({ children }: { children: React.ReactNode }): React.JSX.Element {
  const authContext = useContext(AuthContext)
  const [opened, { toggle }] = useDisclosure()
  if (authContext.isAuthenticated) {
    return (
      <div className='App' style={{ marginTop: '20px' }}>
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 230,
            breakpoint: 'sm',
            collapsed: { mobile: !opened, desktop: !opened }
          }}
          padding="md"
        >
          <Header toggle={toggle} opened={opened}/>

          <Navbar/>
          <AppShell.Main>
            {children}
          </AppShell.Main>

          <AppShell.Footer>
            <Center>
              <div style={{ color: '#888', fontSize: '17px' }}> built by team 8</div>
            </Center>
          </AppShell.Footer>
        </AppShell>
      </div>
    )
  } else {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader/>
      </Center>
    )
  }
}

export default function RootLayout ({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
    <head>
      <ColorSchemeScript/>
      <link rel="shortcut icon" href="/favicon.ico"/>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
      />
      <title>TekClinic</title>
    </head>
    <body>
    <AuthContextProvider>
      <MantineProvider theme={theme}>
        <ContentLayout>{children}</ContentLayout>
      </MantineProvider>
    </AuthContextProvider>
    </body>
    </html>
  )
}
