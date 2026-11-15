import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeMutation, type FakeMutation } from '~test/mutation'

import type { PostDto } from '~/api/models'

import { PostFormModal } from './PostFormModal'

const state: { mutation: FakeMutation } = { mutation: fakeMutation() }

vi.mock('~/api/endpoints/blogging/blogging', () => ({
  getGetPostsQueryKey: (blogId: number) => ['posts', blogId],
  usePostPost: () => state.mutation,
}))

/**
 * Renders the modal for blog 3 with a query client that records invalidations.
 * @param {PostDto} [post] - The post to edit; none for a new one.
 * @returns {{ invalidated: unknown[], closed: string[] }} The invalidated keys and onClose calls.
 */
function renderModal(post?: PostDto) {
  const client = new QueryClient()
  const invalidated: unknown[] = []
  client.invalidateQueries = ((filters: { queryKey: unknown }) => {
    invalidated.push(filters.queryKey)
    return Promise.resolve()
  }) as QueryClient['invalidateQueries']
  const closed: string[] = []
  render(
    <QueryClientProvider client={client}>
      <PostFormModal blogId={3} post={post} onClose={() => closed.push('closed')} />
    </QueryClientProvider>,
  )
  return { invalidated, closed }
}

describe('PostFormModal', () => {
  beforeEach(() => {
    state.mutation = fakeMutation()
  })

  it('creates a post in the blog and refreshes its posts', () => {
    const { invalidated, closed } = renderModal()

    expect(screen.getByRole('heading', { name: 'New post' })).toBeInTheDocument()
    const [title, content] = screen.getAllByRole('textbox')
    fireEvent.change(title!, { target: { value: 'Hello' } })
    fireEvent.change(content!, { target: { value: 'First post' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(state.mutation.calls[0]!.variables).toEqual({
      data: { postId: undefined, blogId: 3, title: 'Hello', content: 'First post' },
    })
    act(() => state.mutation.calls[0]!.onSuccess!())
    expect(invalidated).toEqual([['posts', 3]])
    expect(closed).toEqual(['closed'])
  })

  it('edits a post', () => {
    renderModal({ postId: 9, blogId: 3, title: 'Old', content: 'Text' })

    expect(screen.getByRole('heading', { name: 'Edit post' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(state.mutation.calls[0]!.variables).toEqual({
      data: { postId: 9, blogId: 3, title: 'Old', content: 'Text' },
    })
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
    fireEvent.click(screen.getByRole('heading', { name: 'New post' }))
    expect(closed).toEqual([])
    fireEvent.click(screen.getByRole('dialog'))
    expect(closed).toEqual(['closed'])
  })
})
