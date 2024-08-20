import type React from 'react'
import { Button, Menu, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { FaMoon, FaSun, FaUser } from 'react-icons/fa'
import { CgLogOut } from 'react-icons/cg'
import { federatedLogout, useGuaranteeSession } from '@/src/utils/auth'

const ActionBar: React.FC = () => {
  const session = useGuaranteeSession()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')

  const toggleColorScheme = (): void => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }
  return (
    <>
      <Menu>
        <Menu.Target>
          <Button variant="transparent" color="#ccc" size="md">
            <FaUser/>
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label> logged in as {session.user?.name ?? 'anonymous'}</Menu.Label>
          <Menu.Item
            color="red"
            leftSection={
              <CgLogOut/>
            }
            onClick={() => {
              void federatedLogout()
            }}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Button
        variant="transparent" color="#ccc" size="md"
        onClick={toggleColorScheme}
      >
        {computedColorScheme === 'dark'
          ? <FaSun/>
          : <FaMoon/>}
      </Button>
    </>
  )
}

export default ActionBar
