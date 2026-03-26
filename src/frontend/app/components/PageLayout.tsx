import React from 'react'
import { NavLink } from 'react-router'

import './PageLayout.css'

/**
 * PageLayout component.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children nodes.
 * @returns {React.JSX.Element} The rendered component.
 */
function PageLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <>
      <nav className="flex justify-center gap-6 py-3 text-lg border-b border-neutral-200 dark:border-neutral-700">
        <NavLink className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold dark:text-indigo-400' : 'text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200'} to="/" end>Home</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold dark:text-indigo-400' : 'text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200'} to="/about">About</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'text-indigo-600 font-semibold dark:text-indigo-400' : 'text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200'} to="/blogs">Blogs</NavLink>
      </nav>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
    </>
  )
}

export { PageLayout }
