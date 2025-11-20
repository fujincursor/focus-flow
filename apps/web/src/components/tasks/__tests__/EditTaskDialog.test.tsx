import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditTaskDialog } from '../EditTaskDialog'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types/task'

// Mock the task store
vi.mock('@/stores/taskStore')

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe('EditTaskDialog', () => {
  const mockUpdateTask = vi.fn()
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    time_sensitivity: 'today',
    estimated_duration: 60,
    is_completed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    completed_at: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTaskStore).mockReturnValue({
      updateTask: mockUpdateTask,
    } as any)
  })

  it('renders dialog when open is true', () => {
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('编辑任务')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    render(
      <EditTaskDialog
        task={mockTask}
        open={false}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders all form fields with task data', () => {
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    // Check if form fields are present and pre-filled
    const titleInput = screen.getByLabelText(/任务标题/) as HTMLInputElement
    expect(titleInput).toBeInTheDocument()
    expect(titleInput.value).toBe(mockTask.title)

    const descriptionInput = screen.getByLabelText(/任务描述/) as HTMLTextAreaElement
    expect(descriptionInput).toBeInTheDocument()
    expect(descriptionInput.value).toBe(mockTask.description)

    expect(screen.getByLabelText(/时间敏感度/)).toBeInTheDocument()
    expect(screen.getByLabelText(/预估时长/)).toBeInTheDocument()
  })

  it('pre-fills form with task data', () => {
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    const titleInput = screen.getByLabelText(/任务标题/) as HTMLInputElement
    const descriptionInput = screen.getByLabelText(/任务描述/) as HTMLTextAreaElement
    const durationInput = screen.getByLabelText(/预估时长/) as HTMLInputElement

    expect(titleInput.value).toBe('Test Task')
    expect(descriptionInput.value).toBe('Test Description')
    expect(durationInput.value).toBe('60')
  })

  it('validates required title field', async () => {
    const user = userEvent.setup()
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    const titleInput = screen.getByLabelText(/任务标题/)
    await user.clear(titleInput)

    const submitButton = screen.getByRole('button', { name: '更新任务' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('任务标题不能为空')).toBeInTheDocument()
    })

    expect(mockUpdateTask).not.toHaveBeenCalled()
  })

  it('calls onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnOpenChange = vi.fn()

    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const cancelButton = screen.getByRole('button', { name: '取消' })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockUpdateTask).not.toHaveBeenCalled()
  })

  it('renders with task without description', () => {
    const taskWithoutDescription: Task = {
      ...mockTask,
      description: null,
    }

    render(
      <EditTaskDialog
        task={taskWithoutDescription}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    const descriptionInput = screen.getByLabelText(/任务描述/) as HTMLTextAreaElement
    expect(descriptionInput.value).toBe('')
  })

  it('renders with task without estimated duration', () => {
    const taskWithoutDuration: Task = {
      ...mockTask,
      estimated_duration: null,
    }

    render(
      <EditTaskDialog
        task={taskWithoutDuration}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    const durationInput = screen.getByLabelText(/预估时长/) as HTMLInputElement
    expect(durationInput.value).toBe('')
  })

  it('shows update button text', () => {
    render(
      <EditTaskDialog
        task={mockTask}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: '更新任务' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
  })

  it('renders different time sensitivity options', () => {
    const tasks: Task[] = [
      { ...mockTask, time_sensitivity: 'today' },
      { ...mockTask, time_sensitivity: 'this_week' },
      { ...mockTask, time_sensitivity: 'anytime' },
    ]

    tasks.forEach(task => {
      const { unmount } = render(
        <EditTaskDialog
          task={task}
          open={true}
          onOpenChange={vi.fn()}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      unmount()
    })
  })

  // Note: Form submission and validation tests are skipped due to JSDOM limitations
  // with React Hook Form and Radix UI components (userEvent type, hasPointerCapture issues).
  // These features are covered by E2E tests instead.
})
