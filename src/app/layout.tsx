'use client'
import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import 'mantine-contextmenu/styles.layer.css'
import 'mantine-datatable/styles.layer.css'
import 'react-toastify/dist/ReactToastify.css'

import React from 'react'
import {
  AppShell,
  Burger,
  Button,
  Center,
  ColorSchemeScript,
  createTheme,
  Flex,
  Loader,
  MantineProvider,
  rem,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Navbar from '@/src/components/Navbar'
import { registerLicense } from '@syncfusion/ej2-base'
import { requireBuildEnv } from '@/src/utils/env'
import { SessionProvider, signIn, useSession } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'
import { ContextMenuProvider } from 'mantine-contextmenu'
import { CDN_DARK_THEME_URL, CDN_LIGHT_THEME_URL } from '@/src/app/appointments/const'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/src/api/common'
import { FaMoon, FaSun } from 'react-icons/fa'

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
  const session = useSession()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')

  const toggleColorScheme = (): void => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  const [opened, { toggle }] = useDisclosure(false)

  if (session.status === 'authenticated') {
    return (
      <div className="App" style={{ marginTop: '20px' }}>
        <AppShell
          navbar={{
            width: opened ? 230 : 0,
            breakpoint: 'sm'
          }}
        >
          <Navbar opened={opened} toggle={toggle}/>

          <AppShell.Header>
            <Flex justify="space-between" align="center" style={{ padding: '10px 20px' }}>
              <Burger opened={opened} onClick={toggle} size="sm" transitionDuration={600}/>
              <div style={{
                flexGrow: 1,
                textAlign: 'center',
                fontSize: '25px'
              }}>
                Tekclinic 🩺
              </div>

              <Button
                style={{
                  backgroundColor: 'transparent',
                  fontSize: '17px'
                }}
                size="sm"
                variant="link"
                onClick={toggleColorScheme}
              >
                {computedColorScheme === 'dark' ? <FaSun style={{ color: '#ccc' }}/> : <FaMoon style={{ color: '#ccc' }}/>}
              </Button>
            </Flex>
          </AppShell.Header>

          <AppShell.Main style={{
            paddingLeft: opened ? '250px' : '70px',
            paddingTop: '70px',
            paddingRight: opened ? '20px' : '70px'
          }}>
            {children}
          </AppShell.Main>

          <AppShell.Footer>
            <Center>
              <div style={{
                color: '#888',
                fontSize: '17px'
              }}>
                built by team 8
              </div>
            </Center>
          </AppShell.Footer>
        </AppShell>
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
      {/* for prefetching syncfusion css */}
      <link rel="preload" href={CDN_LIGHT_THEME_URL} as="style"/>
      <link rel="preload" href={CDN_DARK_THEME_URL} as="style"/>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
      />
      <title>TekClinic</title>
    </head>
    <body>
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider refetchInterval={4 * 60}>
          <ContextMenuProvider>
            <ContentLayout>{children}</ContentLayout>
          </ContextMenuProvider>
          <ToastContainer/>
        </SessionProvider>
      </QueryClientProvider>
    </MantineProvider>
    </body>
    </html>
  )
}
