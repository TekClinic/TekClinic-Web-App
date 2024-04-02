import { Flex, Burger, Button, useMantineColorScheme, useComputedColorScheme, AppShell } from '@mantine/core';
import { FaSun, FaMoon } from 'react-icons/fa';

const Header = ({toggle, opened}: any) => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppShell.Header>
      <Flex justify="space-between" align="center" style={{ padding: '10px 20px' }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="md" />
        <Burger opened={opened} onClick={toggle} visibleFrom="sm" size="sm" />
        <div style={{ fontSize: '25px' }}>Tekclinic 🩺</div>
        <Button  style={{ backgroundColor: 'transparent', fontSize: '17px'}} size="sm" variant="link" onClick={toggleColorScheme}>
          {computedColorScheme === 'dark' ? <FaSun style={{ color: '#ccc' }}/> : <FaMoon style={{ color: '#ccc' }}/>}
        </Button>
      </Flex>
    </AppShell.Header>
  );
};

export default Header;