import React from 'react'
import { Text, Tooltip, useMantineTheme } from '@mantine/core'

function phoneNumberWithDashes(phoneNumber: string): string {
  const lastFour = phoneNumber.slice(-4)
  const middleThree = phoneNumber.slice(-7, -4)
  const first = phoneNumber.slice(0, -7)
  return `${first}-${middleThree}-${lastFour}`
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text)
}

interface PhoneNumberProps {
  number: string
}

/**
 * A custom component to render a phone number, and allows the user to click
 * the phone number to copy it to clipboard.
 */
const PhoneNumber: React.FC<PhoneNumberProps> = ({ number }) => {
  const [copied, setCopied] = React.useState(false)
  const theme = useMantineTheme()

  return <Tooltip
    label={copied ? 'Copied!' : 'Copy to clipboard'}
    position='top'
    withArrow
  >
    <Text
      style={{
        color: theme.colors.cyan[8],
        cursor: 'pointer',
        textDecoration: 'underline',
      }}
      component='span'
      onClick={() => {
        copyToClipboard(number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {phoneNumberWithDashes(number)}
    </Text>
  </Tooltip>
}

export default PhoneNumber
