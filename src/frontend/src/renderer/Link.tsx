import React from 'react'
import { usePageContext } from 'vike-react/usePageContext'

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
  const pageContext = usePageContext()
  let pathname = window.location.pathname

  if (pageContext !== undefined) {
    const { urlPathname } = pageContext
    pathname = urlPathname
  }

  const { href } = props
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href)
  const className = [props.className, isActive && 'is-active'].filter(Boolean).join(' ')
  return (
    <a {...props} className={className}>
      {props.children}
    </a>
  )
}

export { Link }
