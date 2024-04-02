'use client';
import MyApp from './MyApp';
import AuthContextProvider from './context/AuthContextProvider';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';

function App() {
  return (
    <AuthContextProvider>
      <MantineProvider>
        <MyApp />
      </MantineProvider>
    </AuthContextProvider>
  )
}

export default App;
