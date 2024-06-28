import React from 'react'
//import { usePageContext } from 'vike-react/usePageContext'

export interface LinkProps {
  children: React.ReactNode
  className: string
  href: string
}

/**
 * Link component.
 * @param {LinkProps} props - The component props.
 * @returns {React.JSX.Element} The rendered component.
 */
function Link(props: Readonly<LinkProps>): React.JSX.Element {
  // With SSR:
  // const pageContext = usePageContext()
  // const { urlPathname } = pageContext
  const urlPathname = window.location.pathname
  const { href } = props
  const isActive = href === '/' ? urlPathname === href : urlPathname.startsWith(href)
  const className = [props.className, isActive && 'is-active'].filter(Boolean).join(' ')
  return (
    <a {...props} className={className}>
      {props.children}
    </a>
  )
}

export { Link }
