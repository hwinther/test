import React from 'react'
import { NavLink } from 'react-router'

import './PageLayout.css'

/**
 * Content component.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children nodes.
 * @returns {React.JSX.Element} The rendered component.
 */
function Content({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <div>{children}</div>
}

/**
 * Navigation component.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children nodes.
 * @returns {React.JSX.Element} The rendered component.
 */
function Navigation({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: '1.2em',
        gap: 25,
        justifyContent: 'center',
        paddingBottom: 25,
        paddingTop: 5,
      }}
    >
      {children}
    </div>
  )
}

/**
 * PageLayout component.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children nodes.
 * @returns {React.JSX.Element} The rendered component.
 */
function PageLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <>
      <Navigation>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/blogs">Blogs</NavLink>
      </Navigation>
      <Content>{children}</Content>
    </>
  )
}

export { PageLayout }
