'use client'
import '@mantine/core/styles.css'
import React from 'react'
import {
  AppShell,
  Center,
  ColorSchemeScript,
  createTheme,
  Loader,
  MantineProvider,
  rem
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Header from '@/src/components/Header'
import Navbar from '@/src/components/Navbar'
import { registerLicense } from '@syncfusion/ej2-base'
import { requireBuildEnv } from '@/src/utils/env'
import { SessionProvider, signIn, useSession } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'

registerLicense(requireBuildEnv('NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY',
  process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY))

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'blue',
  colors: {
    deepBlue: [
      '#eef3ff',
      '#dce4f5',
      '#b9c7e2',
      '#94a8d0',
      '#748dc1',
      '#5f7cb8',
      '#5474b4',
      '#44639f',
      '#39588f',
      '#2d4b81'
    ],
    blue: [
      '#eef3ff',
      '#dee2f2',
      '#bdc2de',
      '#98a0ca',
      '#7a84ba',
      '#6672b0',
      '#5c68ac',
      '#4c5897',
      '#424e88',
      '#364379'
    ],
    white: [
      '#eef3ff',
      '#dee2f2',
      '#bdc2de',
      '#98a0ca',
      '#7a84ba',
      '#6672b0',
      '#5c68ac',
      '#4c5897',
      '#424e88',
      '#364379'
    ]
  },
  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)'
  },
  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
      h2: { fontSize: rem(24) },
      h3: { fontSize: rem(20) },
      h4: { fontSize: rem(18) },
      h5: { fontSize: rem(16) },
      h6: { fontSize: rem(14) }
    },
    fontWeight: 'l'
  }
})

function ContentLayout ({ children }: {
  children: React.ReactNode
}): React.JSX.Element {
  const [opened, { toggle }] = useDisclosure()
  const session = useSession()
  if (session.status === 'authenticated') {
    return (
      <div className="App" style={{ marginTop: '20px' }}>
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
              <div style={{ color: '#888', fontSize: '17px' }}>
                built by team 8
              </div>
            </Center>
          </AppShell.Footer>
        </AppShell>
        <ToastContainer/>
      </div>
    )
  }
  if (session.status === 'unauthenticated') {
    void signIn('keycloak')
  }
  return (
    <Center style={{ height: '100vh' }}>
      <Loader/>
    </Center>
  )
}

export default function RootLayout ({ children }: {
  children: React.ReactNode
}): React.JSX.Element {
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
    <MantineProvider theme={theme}>
      <SessionProvider refetchInterval={4 * 60}>
        <ContentLayout>{children}</ContentLayout>
      </SessionProvider>
    </MantineProvider>
    </body>
    </html>
  )
}
