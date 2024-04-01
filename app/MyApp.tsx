import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContextProvider';
import { useDisclosure } from '@mantine/hooks';
import {AppShell, Center, Loader} from '@mantine/core';
import './App.css';
import Navbar from './components/Navbar';
import Header from './components/Header';
import RouterSwitcher from './components/RouterSwitcher';

function MyApp() {
  const authContext = useContext(AuthContext);
  const [opened, {toggle}] = useDisclosure();

  return (
    authContext.isAuthenticated ? (
      <div className='App' style={{marginTop: '20px'}}>
      <AppShell
      header={{ height: 60}}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: { mobile: !opened}
      }}
      padding="md"
    >
      <Header toggle={toggle} opened={opened} />

      <Navbar />
      <AppShell.Main>
        <RouterSwitcher />
      </AppShell.Main>

      <AppShell.Footer>
        <div style={{ color: '#888', fontSize: '17px'}}> built by team 8 </div>
      </AppShell.Footer>
      </AppShell>
    </div>
    ) : (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    )
  );
}
export default MyApp;
