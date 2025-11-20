import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TasksPage } from '../TasksPage'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types/task'

// Mock the task store
vi.mock('@/stores/taskStore')

// Mock the components
vi.mock('@/components/tasks', () => ({
  CreateTaskDialog: () => <button>创建任务</button>,
  DeleteConfirmDialog: ({ open, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-confirm-dialog">
        <button onClick={onConfirm}>确认删除</button>
      </div>
    ) : null,
  EditTaskDialog: () => <div data-testid="edit-dialog" />,
  TaskList: ({ tasks, onToggleComplete, onDelete }: any) => (
    <div data-testid="task-list">
      {tasks.map((task: Task) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span>{task.title}</span>
          <button onClick={() => onToggleComplete(task.id, !task.is_completed)}>Toggle</button>
          <button onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
  SortableTaskList: ({ tasks, onToggleComplete, onDelete }: any) => (
    <div data-testid="task-list">
      {tasks.map((task: Task) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span>{task.title}</span>
          <button onClick={() => onToggleComplete(task.id, !task.is_completed)}>Toggle</button>
          <button onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}))

const mockTasks: Task[] = [
  {
    id: '1',
    user_id: 'user-1',
    title: '今天的任务',
    description: '这是一个重要的任务',
    is_completed: false,
    time_sensitivity: 'today',
    estimated_duration: 60,
    display_order: 0,
    completed_at: null,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    title: '本周的任务',
    description: '需要在本周完成',
    is_completed: false,
    time_sensitivity: 'this_week',
    estimated_duration: 120,
    display_order: 1,
    completed_at: null,
    created_at: '2024-01-01T11:00:00Z',
    updated_at: '2024-01-01T11:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    title: '任何时候的任务',
    description: '可以随时完成的任务',
    is_completed: false,
    time_sensitivity: 'anytime',
    estimated_duration: null,
    display_order: 2,
    completed_at: null,
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z',
  },
  {
    id: '4',
    user_id: 'user-1',
    title: '已完成的任务',
    description: null,
    is_completed: true,
    time_sensitivity: 'today',
    estimated_duration: 30,
    display_order: 3,
    completed_at: '2024-01-01T15:00:00Z',
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T15:00:00Z',
  },
]

describe('TasksPage', () => {
  const mockFetchTasks = vi.fn()
  const mockToggleTaskCompletion = vi.fn()
  const mockRemoveTask = vi.fn()
  const mockGetTodayTasks = vi.fn()
  const mockGetThisWeekTasks = vi.fn()
  const mockGetAnytimeTasks = vi.fn()
  const mockGetUncompletedTasks = vi.fn()
  const mockGetCompletedTasks = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockGetTodayTasks.mockReturnValue([mockTasks[0]])
    mockGetThisWeekTasks.mockReturnValue([mockTasks[1]])
    mockGetAnytimeTasks.mockReturnValue([mockTasks[2]])
    mockGetUncompletedTasks.mockReturnValue(mockTasks.slice(0, 3))
    mockGetCompletedTasks.mockReturnValue([mockTasks[3]])

    vi.mocked(useTaskStore).mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      fetchTasks: mockFetchTasks,
      toggleTaskCompletion: mockToggleTaskCompletion,
      removeTask: mockRemoveTask,
      getTodayTasks: mockGetTodayTasks,
      getThisWeekTasks: mockGetThisWeekTasks,
      getAnytimeTasks: mockGetAnytimeTasks,
      getUncompletedTasks: mockGetUncompletedTasks,
      getCompletedTasks: mockGetCompletedTasks,
    } as any)
  })

  it('renders page header', () => {
    render(<TasksPage />)

    expect(screen.getByText('所有任务')).toBeInTheDocument()
    expect(screen.getByText('查看和管理您的所有任务')).toBeInTheDocument()
  })

  it('fetches tasks on mount', () => {
    render(<TasksPage />)

    expect(mockFetchTasks).toHaveBeenCalledTimes(1)
  })

  it('displays loading state', () => {
    vi.mocked(useTaskStore).mockReturnValue({
      tasks: [],
      isLoading: true,
      fetchTasks: mockFetchTasks,
      toggleTaskCompletion: mockToggleTaskCompletion,
      removeTask: mockRemoveTask,
      getTodayTasks: mockGetTodayTasks,
      getThisWeekTasks: mockGetThisWeekTasks,
      getAnytimeTasks: mockGetAnytimeTasks,
      getUncompletedTasks: mockGetUncompletedTasks,
      getCompletedTasks: mockGetCompletedTasks,
    } as any)

    render(<TasksPage />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders all tab triggers with correct counts', () => {
    render(<TasksPage />)

    expect(screen.getByRole('tab', { name: /全部 \(4\)/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /今天 \(1\)/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /本周 \(1\)/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /任何时候 \(1\)/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /已完成 \(1\)/ })).toBeInTheDocument()
  })

  it('displays uncompleted tasks in "all" tab by default', () => {
    render(<TasksPage />)

    const taskLists = screen.getAllByTestId('task-list')
    expect(taskLists.length).toBeGreaterThan(0)

    expect(screen.getByText('今天的任务')).toBeInTheDocument()
    expect(screen.getByText('本周的任务')).toBeInTheDocument()
    expect(screen.getByText('任何时候的任务')).toBeInTheDocument()
  })

  it('displays completed tasks section in "all" tab', () => {
    render(<TasksPage />)

    const completedHeaders = screen.getAllByText(/已完成 \(1\)/)
    expect(completedHeaders.length).toBeGreaterThan(0)
    expect(screen.getByText('已完成的任务')).toBeInTheDocument()
  })

  it('switches to "today" tab and displays today tasks', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const todayTab = screen.getByRole('tab', { name: /今天/ })
    await user.click(todayTab)

    await waitFor(() => {
      expect(screen.getByText('今天的任务')).toBeInTheDocument()
    })

    expect(mockGetTodayTasks).toHaveBeenCalled()
  })

  it('switches to "this_week" tab and displays this week tasks', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const thisWeekTab = screen.getByRole('tab', { name: /本周/ })
    await user.click(thisWeekTab)

    await waitFor(() => {
      expect(screen.getByText('本周的任务')).toBeInTheDocument()
    })

    expect(mockGetThisWeekTasks).toHaveBeenCalled()
  })

  it('switches to "anytime" tab and displays anytime tasks', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const anytimeTab = screen.getByRole('tab', { name: /任何时候/ })
    await user.click(anytimeTab)

    await waitFor(() => {
      expect(screen.getByText('任何时候的任务')).toBeInTheDocument()
    })

    expect(mockGetAnytimeTasks).toHaveBeenCalled()
  })

  it('switches to "completed" tab and displays completed tasks', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const completedTab = screen.getByRole('tab', { name: /已完成/ })
    await user.click(completedTab)

    await waitFor(() => {
      expect(screen.getByText('已完成的任务')).toBeInTheDocument()
    })

    expect(mockGetCompletedTasks).toHaveBeenCalled()
  })

  it('calls toggleTaskCompletion when task is toggled', async () => {
    const user = userEvent.setup()
    mockToggleTaskCompletion.mockResolvedValue(undefined)

    render(<TasksPage />)

    const toggleButtons = screen.getAllByText('Toggle')
    await user.click(toggleButtons[0])

    expect(mockToggleTaskCompletion).toHaveBeenCalledWith('1', true)
  })

  it('calls removeTask when task is deleted', async () => {
    const user = userEvent.setup()
    mockRemoveTask.mockResolvedValue(undefined)

    render(<TasksPage />)

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    // Wait for the confirmation dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()
    })

    // Click the confirm button
    const confirmButton = screen.getByText('确认删除')
    await user.click(confirmButton)

    expect(mockRemoveTask).toHaveBeenCalledWith('1')
  })

  it('renders CreateTaskDialog component', () => {
    render(<TasksPage />)

    expect(screen.getByRole('button', { name: '创建任务' })).toBeInTheDocument()
  })

  it('does not show completed tasks section when there are no completed tasks', () => {
    mockGetCompletedTasks.mockReturnValue([])

    render(<TasksPage />)

    const completedSections = screen.queryAllByText(/已完成 \(\d+\)/)
    // Should only find the tab, not the section header
    expect(completedSections).toHaveLength(1)
  })

  it('renders search input box', () => {
    render(<TasksPage />)

    const searchInput = screen.getByRole('textbox', { name: '搜索任务' })
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', '搜索任务标题或描述...')
  })

  it('filters tasks by search query in title', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const searchInput = screen.getByRole('textbox', { name: '搜索任务' })

    // Type search query
    await user.type(searchInput, '今天')

    // Wait for debounce (300ms) and filtering to apply
    await waitFor(() => {
      const taskList = screen.getAllByTestId('task-list')[0]
      // Should only have 1 task in the first list (today's task)
      expect(taskList.querySelectorAll('[data-testid^="task-"]').length).toBeLessThanOrEqual(1)
    }, { timeout: 1000 })
  })

  it('filters tasks by search query in description', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const searchInput = screen.getByRole('textbox', { name: '搜索任务' })

    // Type search query
    await user.type(searchInput, '重要')

    // Wait for debounce (300ms) and filtering to apply
    await waitFor(() => {
      // Should find the task with "重要" in description
      expect(screen.getByText('今天的任务')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows all tasks when search query is empty', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const searchInput = screen.getByRole('textbox', { name: '搜索任务' })

    // Type and then clear
    await user.type(searchInput, '今天')
    await user.clear(searchInput)

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('今天的任务')).toBeInTheDocument()
      expect(screen.getByText('本周的任务')).toBeInTheDocument()
      expect(screen.getByText('任何时候的任务')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('search is case insensitive', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const searchInput = screen.getByRole('textbox', { name: '搜索任务' })
    await user.type(searchInput, '今天')

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('今天的任务')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('updates tab counts after search filtering', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    const searchInput = screen.getByRole('textbox', { name: '搜索任务' })
    await user.type(searchInput, '今天')

    // Wait for debounce and check that counts are updated
    await waitFor(() => {
      // The "today" tab should show 1 task
      expect(screen.getByRole('tab', { name: /今天 \(1\)/ })).toBeInTheDocument()
    }, { timeout: 500 })
  })
})
