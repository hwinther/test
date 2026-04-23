import { type JSX, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'

import { getGetPostsQueryKey, usePostPost } from '~/api/endpoints/blogging/blogging'
import type { PostDto } from '~/api/models'

interface PostFormModalProps {
  readonly blogId: number
  readonly post?: PostDto
  readonly onClose: () => void
}

/**
 * Modal form for creating or editing a post within a blog.
 * Invalidates the post list for the blog on success.
 * @param {PostFormModalProps} props - Component props.
 * @returns {JSX.Element} The post form modal.
 */
export function PostFormModal({ blogId, post, onClose }: PostFormModalProps): JSX.Element {
  const isEdit = post !== undefined
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = usePostPost()

  const [title, setTitle] = useState(post?.title ?? '')
  const [content, setContent] = useState(post?.content ?? '')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(
      { data: { postId: post?.postId, blogId, title, content } },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey(blogId) })
          dialogRef.current?.close()
        },
      },
    )
  }

  return (
    <dialog
      ref={dialogRef}
      className="rounded-xl shadow-2xl p-0 backdrop:bg-black/50 w-full max-w-lg"
      onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close() }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold">{isEdit ? 'Edit post' : 'New post'}</h2>
        <button
          aria-label="Close"
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer text-xl leading-none"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <Field label="Title" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
        <Field label="Content" required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        </Field>

        {error != null && <p className="text-sm text-red-600">Failed to save. Please try again.</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-md px-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

interface FieldProps {
  readonly label: string
  readonly required?: boolean
  readonly children: React.ReactNode
}

function Field({ label, required, children }: FieldProps): JSX.Element {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required === true && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
