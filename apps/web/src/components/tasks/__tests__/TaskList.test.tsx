import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from '../TaskList'
import type { Task } from '@/types/task'

const mockTasks: Task[] = [
  {
    id: '1',
    user_id: 'user-1',
    title: '完成项目报告',
    description: '需要在今天下班前提交',
    is_completed: false,
    time_sensitivity: 'today',
    estimated_duration: 120,
    display_order: 0,
    completed_at: null,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    title: '准备演讲材料',
    description: null,
    is_completed: false,
    time_sensitivity: 'this_week',
    estimated_duration: 60,
    display_order: 1,
    completed_at: null,
    created_at: '2024-01-01T11:00:00Z',
    updated_at: '2024-01-01T11:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    title: '已完成的任务',
    description: '这个任务已经完成了',
    is_completed: true,
    time_sensitivity: 'anytime',
    estimated_duration: null,
    display_order: 2,
    completed_at: '2024-01-01T15:00:00Z',
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T15:00:00Z',
  },
]

describe('TaskList', () => {
  it('renders empty state when no tasks', () => {
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(<TaskList tasks={[]} onToggleComplete={onToggleComplete} onDelete={onDelete} />)

    expect(screen.getByText('暂无任务')).toBeInTheDocument()
    expect(screen.getByText(/点击"创建任务"开始添加您的第一个任务/)).toBeInTheDocument()
  })

  it('renders task list with all tasks', () => {
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(<TaskList tasks={mockTasks} onToggleComplete={onToggleComplete} onDelete={onDelete} />)

    expect(screen.getByText('完成项目报告')).toBeInTheDocument()
    expect(screen.getByText('需要在今天下班前提交')).toBeInTheDocument()
    expect(screen.getByText('准备演讲材料')).toBeInTheDocument()
    expect(screen.getByText('已完成的任务')).toBeInTheDocument()
  })

  it('displays time sensitivity badges correctly', () => {
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(<TaskList tasks={mockTasks} onToggleComplete={onToggleComplete} onDelete={onDelete} />)

    expect(screen.getByText('今天')).toBeInTheDocument()
    expect(screen.getByText('本周')).toBeInTheDocument()
    expect(screen.getByText('任何时候')).toBeInTheDocument()
  })

  it('displays estimated duration when available', () => {
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(<TaskList tasks={mockTasks} onToggleComplete={onToggleComplete} onDelete={onDelete} />)

    expect(screen.getByText('2小时')).toBeInTheDocument()
    expect(screen.getByText('1小时')).toBeInTheDocument()
  })

  it('calls onToggleComplete when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(<TaskList tasks={mockTasks} onToggleComplete={onToggleComplete} onDelete={onDelete} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(onToggleComplete).toHaveBeenCalledWith('1', true)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(<TaskList tasks={mockTasks} onToggleComplete={onToggleComplete} onDelete={onDelete} />)

    const deleteButtons = screen.getAllByRole('button', { name: /删除任务/ })
    await user.click(deleteButtons[0])

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('applies completed styling to completed tasks', () => {
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(
      <TaskList tasks={mockTasks} onToggleComplete={onToggleComplete} onDelete={onDelete} />
    )

    const completedTaskTitle = screen.getByText('已完成的任务')
    expect(completedTaskTitle).toHaveClass('line-through')
  })

  it('displays completed timestamp for completed tasks', () => {
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(<TaskList tasks={mockTasks} onToggleComplete={onToggleComplete} onDelete={onDelete} />)

    expect(screen.getByText(/完成于/)).toBeInTheDocument()
  })

  it('does not display description when it is null', () => {
    const onToggleComplete = vi.fn()
    const onDelete = vi.fn()

    render(
      <TaskList tasks={[mockTasks[1]]} onToggleComplete={onToggleComplete} onDelete={onDelete} />
    )

    expect(screen.queryByText('需要在今天下班前提交')).not.toBeInTheDocument()
  })
})
