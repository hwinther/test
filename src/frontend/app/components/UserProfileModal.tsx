import { type JSX, useEffect, useRef } from 'react'
import { useAuth } from '~/auth.context'

interface UserProfileModalProps {
  readonly onClose: () => void
}

/**
 * Modal dialogue that displays the signed-in user's profile claims
 * (name, email, groups, subject) from the OIDC id token.
 * @param {UserProfileModalProps} props - Component props.
 * @returns {JSX.Element} The profile modal.
 */
export function UserProfileModal({ onClose }: UserProfileModalProps): JSX.Element {
  const { user } = useAuth()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const profile = user?.profile
  const groups = profile?.['groups']
  const groupList: string[] = Array.isArray(groups) ? groups : typeof groups === 'string' ? [groups] : []

  return (
    <dialog
      ref={dialogRef}
      className="rounded-xl shadow-2xl p-0 backdrop:bg-black/50 w-full max-w-md"
      onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close() }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold">Profile</h2>
        <button
          aria-label="Close"
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer text-xl leading-none"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
      </div>

      <dl className="px-6 py-5 space-y-4 text-sm">
        <Row label="Name" value={profile?.name} />
        <Row label="Username" value={profile?.preferred_username} />
        <Row label="Email">
          <span>{profile?.email}</span>
          {profile?.email_verified === true && (
            <span className="ml-2 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5">
              verified
            </span>
          )}
        </Row>
        {groupList.length > 0 && (
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400 mb-1">Groups</dt>
            <dd className="flex flex-wrap gap-2">
              {groupList.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-0.5"
                >
                  {g}
                </span>
              ))}
            </dd>
          </div>
        )}
        <Row label="Subject" value={profile?.sub} mono />
      </dl>
    </dialog>
  )
}

interface RowProps {
  readonly label: string
  readonly value?: string
  readonly mono?: boolean
  readonly children?: React.ReactNode
}

function Row({ label, value, mono = false, children }: RowProps): JSX.Element | null {
  if (!children && !value) return null
  return (
    <div>
      <dt className="text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</dt>
      <dd className={mono ? 'font-mono text-xs break-all' : ''}>
        {children ?? value}
      </dd>
    </div>
  )
}
