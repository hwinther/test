import React from 'react'

function Center({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: 'calc(100vh - 100px)',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}

function Page(): React.JSX.Element {
  return (
    <Center>
      <p style={{ fontSize: '1.3em' }}>This page doesn&apos;t exist.</p>
    </Center>
  )
}

export default Page
