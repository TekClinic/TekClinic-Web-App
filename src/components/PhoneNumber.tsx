import React from 'react'
import { Text, Tooltip, useMantineTheme } from '@mantine/core'

function phoneNumberWithDashes (phoneNumber: string): string {
  const lastFour = phoneNumber.slice(-4)
  const middleThree = phoneNumber.slice(-7, -4)
  const first = phoneNumber.slice(0, -7)
  return `${first}-${middleThree}-${lastFour}`
}

async function copyToClipboard (text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

interface PhoneNumberProps {
  number: string
}

/**
 * A custom component to render a phone number, and allows the user to click
 * the phone number to copy it to clipboard.
 */
const PhoneNumber: React.FC<PhoneNumberProps> = ({ number }) => {
  type Error = string
  const [copied, setCopied] = React.useState<boolean | Error>(false)
  const theme = useMantineTheme()

  return <Tooltip
    label={copied === true ? 'Copied!' : copied === false ? 'Copy to clipboard' : copied}
    position='top'
    withArrow
  >
    <Text
      style={{
        color: theme.colors.cyan[8],
        cursor: 'pointer',
        textDecoration: 'underline'
      }}
      component='span'
      onClick={() => {
        copyToClipboard(number)
          .then(() => { setCopied(true) })
          .catch(() => { setCopied('Error!') })
        setTimeout(() => { setCopied(false) }, 2000)
      }}
    >
      {phoneNumberWithDashes(number)}
    </Text>
  </Tooltip>
}

export default PhoneNumber
