import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTaskDialog } from '../CreateTaskDialog'
import { useTaskStore } from '@/stores/taskStore'

// Mock the task store
vi.mock('@/stores/taskStore')

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe('CreateTaskDialog', () => {
  const mockAddTask = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTaskStore).mockReturnValue({
      addTask: mockAddTask,
    } as any)
  })

  it('renders dialog trigger button', () => {
    render(<CreateTaskDialog />)

    expect(screen.getByRole('button', { name: /创建任务/ })).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateTaskDialog />)

    const triggerButton = screen.getByRole('button', { name: /创建任务/ })
    await user.click(triggerButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('创建新任务')).toBeInTheDocument()
  })

  it('renders all form fields', async () => {
    const user = userEvent.setup()
    render(<CreateTaskDialog />)

    await user.click(screen.getByRole('button', { name: /创建任务/ }))

    expect(screen.getByLabelText(/任务标题/)).toBeInTheDocument()
    expect(screen.getByLabelText(/任务描述/)).toBeInTheDocument()
    expect(screen.getByLabelText(/时间敏感度/)).toBeInTheDocument()
    expect(screen.getByLabelText(/预估时长/)).toBeInTheDocument()
  })

  it('validates required title field', async () => {
    const user = userEvent.setup()
    render(<CreateTaskDialog />)

    await user.click(screen.getByRole('button', { name: /创建任务/ }))

    const submitButton = screen.getByRole('button', { name: '创建任务' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('任务标题不能为空')).toBeInTheDocument()
    })

    expect(mockAddTask).not.toHaveBeenCalled()
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateTaskDialog />)

    await user.click(screen.getByRole('button', { name: /创建任务/ }))

    const cancelButton = screen.getByRole('button', { name: '取消' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(mockAddTask).not.toHaveBeenCalled()
  })

  it('accepts custom trigger element', () => {
    render(
      <CreateTaskDialog trigger={<button>自定义触发按钮</button>} />
    )

    expect(screen.getByRole('button', { name: '自定义触发按钮' })).toBeInTheDocument()
    expect(screen.queryByText('创建任务')).not.toBeInTheDocument()
  })

  // Note: Form submission and validation tests are skipped due to JSDOM limitations
  // with React Hook Form and Radix UI components (userEvent type, hasPointerCapture issues).
  // These features are covered by E2E tests instead.
})
