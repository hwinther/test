import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeMutation, type FakeMutation } from '~test/mutation'

import type { BlogDto } from '~/api/models'

import { BlogFormModal } from './BlogFormModal'

const state: { mutation: FakeMutation } = { mutation: fakeMutation() }

vi.mock('~/api/endpoints/blogging/blogging', () => ({
  getGetBlogsQueryKey: () => ['blogs'],
  getGetBlogQueryKey: (id: number) => ['blog', id],
  usePostBlog: () => state.mutation,
}))

/**
 * Renders the modal with a query client that records invalidations.
 * @param {BlogDto} [blog] - The blog to edit; none for a new one.
 * @returns {{ invalidated: unknown[], closed: string[] }} The invalidated keys and onClose calls.
 */
function renderModal(blog?: BlogDto) {
  const client = new QueryClient()
  const invalidated: unknown[] = []
  client.invalidateQueries = ((filters: { queryKey: unknown }) => {
    invalidated.push(filters.queryKey)
    return Promise.resolve()
  }) as QueryClient['invalidateQueries']
  const closed: string[] = []
  render(
    <QueryClientProvider client={client}>
      <BlogFormModal blog={blog} onClose={() => closed.push('closed')} />
    </QueryClientProvider>,
  )
  return { invalidated, closed }
}

describe('BlogFormModal', () => {
  beforeEach(() => {
    state.mutation = fakeMutation()
  })

  it('creates a blog and refreshes the list', () => {
    const { invalidated, closed } = renderModal()

    expect(screen.getByRole('dialog')).toHaveAttribute('open')
    expect(screen.getByRole('heading', { name: 'New blog' })).toBeInTheDocument()
    const [title, url] = screen.getAllByRole('textbox')
    fireEvent.change(title!, { target: { value: 'Kitchen' } })
    fireEvent.change(url!, { target: { value: 'https://kitchen.test' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(state.mutation.calls).toHaveLength(1)
    expect(state.mutation.calls[0]!.variables).toEqual({
      data: { blogId: undefined, title: 'Kitchen', url: 'https://kitchen.test' },
    })
    act(() => state.mutation.calls[0]!.onSuccess!())
    expect(invalidated).toEqual([['blogs']])
    expect(closed).toEqual(['closed'])
  })

  it('edits a blog and refreshes it as well', () => {
    const { invalidated } = renderModal({ blogId: 7, title: 'Old', url: 'https://old.test' })

    expect(screen.getByRole('heading', { name: 'Edit blog' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Old')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    act(() => state.mutation.calls[0]!.onSuccess!())

    expect(state.mutation.calls[0]!.variables).toEqual({ data: { blogId: 7, title: 'Old', url: 'https://old.test' } })
    expect(invalidated).toEqual([['blogs'], ['blog', 7]])
  })

  it('shows the saving and failure states', () => {
    state.mutation.isPending = true
    state.mutation.error = new Error('500')
    renderModal()

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
    expect(screen.getByText('Failed to save. Please try again.')).toBeInTheDocument()
  })

  it.each(['Close', 'Cancel'])('closes with %s', (name) => {
    const { closed } = renderModal()
    fireEvent.click(screen.getByRole('button', { name }))
    expect(closed).toEqual(['closed'])
  })

  it('closes on a click on the backdrop, not inside', () => {
    const { closed } = renderModal()
    fireEvent.click(screen.getByRole('heading', { name: 'New blog' }))
    expect(closed).toEqual([])
    fireEvent.click(screen.getByRole('dialog'))
    expect(closed).toEqual(['closed'])
  })
})
