import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmDialog } from '../DeleteConfirmDialog'
import type { Task } from '@/types/task'

describe('DeleteConfirmDialog', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    time_sensitivity: 'today',
    estimated_duration: 60,
    is_completed: false,
    display_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    completed_at: null,
  }

  it('renders dialog when open is true', () => {
    render(
      <DeleteConfirmDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('确认删除任务')).toBeInTheDocument()
    expect(screen.getByText(/你确定要删除任务 "Test Task" 吗/)).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    render(
      <DeleteConfirmDialog
        task={mockTask}
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('renders cancel and delete buttons', () => {
    render(
      <DeleteConfirmDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  it('calls onOpenChange with false when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnOpenChange = vi.fn()

    render(
      <DeleteConfirmDialog
        task={mockTask}
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={vi.fn()}
      />
    )

    const cancelButton = screen.getByRole('button', { name: '取消' })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnConfirm = vi.fn()

    render(
      <DeleteConfirmDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={mockOnConfirm}
      />
    )

    const deleteButton = screen.getByRole('button', { name: '删除' })
    await user.click(deleteButton)

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('displays task title in confirmation message', () => {
    const taskWithLongTitle: Task = {
      ...mockTask,
      title: '这是一个很长的任务标题用于测试',
    }

    render(
      <DeleteConfirmDialog
        task={taskWithLongTitle}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText(/这是一个很长的任务标题用于测试/)).toBeInTheDocument()
  })

  it('handles null task gracefully', () => {
    render(
      <DeleteConfirmDialog
        task={null}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    // Should still render dialog structure
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
