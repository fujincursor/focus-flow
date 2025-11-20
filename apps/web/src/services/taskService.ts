import { supabase } from '@/lib/supabase'
import type { Task, TaskRow, CreateTaskInput, UpdateTaskInput } from '@/types/task'
import { createTaskSchema, updateTaskSchema } from '@/types/task'

/**
 * Custom error class for task service errors
 */
export class TaskServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'TaskServiceError'
  }
}

/**
 * Convert database row to Task type
 */
function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    time_sensitivity: row.time_sensitivity,
    estimated_duration: row.estimated_duration,
    is_completed: row.is_completed,
    completed_at: row.completed_at,
    display_order: row.display_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/**
 * Get all tasks for the current user
 * @returns Array of tasks sorted by created_at descending
 */
export async function getTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new TaskServiceError('获取任务列表失败', error.code, error)
    }

    if (!data) {
      return []
    }

    return data.map(rowToTask)
  } catch (error) {
    if (error instanceof TaskServiceError) {
      throw error
    }
    throw new TaskServiceError('获取任务列表时发生未知错误', undefined, error)
  }
}

/**
 * Get a single task by ID
 * @param taskId - The UUID of the task
 * @returns Task object or null if not found
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new TaskServiceError('获取任务失败', error.code, error)
    }

    if (!data) {
      return null
    }

    return rowToTask(data as TaskRow)
  } catch (error) {
    if (error instanceof TaskServiceError) {
      throw error
    }
    throw new TaskServiceError('获取任务时发生未知错误', undefined, error)
  }
}

/**
 * Create a new task
 * @param input - Task creation data
 * @returns The created task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  try {
    // Validate input
    const validatedInput = createTaskSchema.parse(input)

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new TaskServiceError('用户未登录', 'UNAUTHENTICATED')
    }

    // Insert task
    const { data, error } = await supabase
      .from('tasks')
      // @ts-expect-error - Supabase type inference issue with insert()
      .insert({
        user_id: user.id,
        title: validatedInput.title,
        description: validatedInput.description || null,
        time_sensitivity: validatedInput.time_sensitivity,
        estimated_duration: validatedInput.estimated_duration || null,
      })
      .select()
      .single()

    if (error) {
      throw new TaskServiceError('创建任务失败', error.code, error)
    }

    if (!data) {
      throw new TaskServiceError('创建任务失败：未返回数据')
    }

    return rowToTask(data as TaskRow)
  } catch (error) {
    if (error instanceof TaskServiceError) {
      throw error
    }
    if (error instanceof Error && error.name === 'ZodError') {
      throw new TaskServiceError('任务数据验证失败', 'VALIDATION_ERROR', error)
    }
    throw new TaskServiceError('创建任务时发生未知错误', undefined, error)
  }
}

/**
 * Update an existing task
 * @param taskId - The UUID of the task to update
 * @param input - Fields to update
 * @returns The updated task
 */
export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  try {
    // Validate input
    const validatedInput = updateTaskSchema.parse(input)

    // Prepare update data
    const updateData: Partial<TaskRow> = {}
    if (validatedInput.title !== undefined) updateData.title = validatedInput.title
    if (validatedInput.description !== undefined) updateData.description = validatedInput.description || null
    if (validatedInput.time_sensitivity !== undefined)
      updateData.time_sensitivity = validatedInput.time_sensitivity
    if (validatedInput.estimated_duration !== undefined)
      updateData.estimated_duration = validatedInput.estimated_duration || null
    if (validatedInput.is_completed !== undefined) {
      updateData.is_completed = validatedInput.is_completed
      // Set completed_at when marking as completed
      if (validatedInput.is_completed) {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
    }

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      // @ts-expect-error - Supabase type inference issue with update()
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new TaskServiceError('任务不存在或无权限访问', 'NOT_FOUND')
      }
      throw new TaskServiceError('更新任务失败', error.code, error)
    }

    if (!data) {
      throw new TaskServiceError('更新任务失败：未返回数据')
    }

    return rowToTask(data as TaskRow)
  } catch (error) {
    if (error instanceof TaskServiceError) {
      throw error
    }
    if (error instanceof Error && error.name === 'ZodError') {
      throw new TaskServiceError('任务数据验证失败', 'VALIDATION_ERROR', error)
    }
    throw new TaskServiceError('更新任务时发生未知错误', undefined, error)
  }
}

/**
 * Delete a task
 * @param taskId - The UUID of the task to delete
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)

    if (error) {
      throw new TaskServiceError('删除任务失败', error.code, error)
    }
  } catch (error) {
    if (error instanceof TaskServiceError) {
      throw error
    }
    throw new TaskServiceError('删除任务时发生未知错误', undefined, error)
  }
}

/**
 * Mark a task as completed or uncompleted
 * @param taskId - The UUID of the task
 * @param completed - Whether the task should be marked as completed
 * @returns The updated task
 */
export async function completeTask(taskId: string, completed: boolean = true): Promise<Task> {
  return updateTask(taskId, { is_completed: completed })
}

/**
 * Get tasks filtered by completion status
 * @param completed - Filter by completion status (true/false/undefined for all)
 * @returns Array of filtered tasks
 */
export async function getTasksByStatus(completed?: boolean): Promise<Task[]> {
  try {
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })

    if (completed !== undefined) {
      query = query.eq('is_completed', completed)
    }

    const { data, error } = await query

    if (error) {
      throw new TaskServiceError('获取任务列表失败', error.code, error)
    }

    if (!data) {
      return []
    }

    return data.map(rowToTask)
  } catch (error) {
    if (error instanceof TaskServiceError) {
      throw error
    }
    throw new TaskServiceError('获取任务列表时发生未知错误', undefined, error)
  }
}

/**
 * Get tasks filtered by time sensitivity
 * @param timeSensitivity - The time sensitivity filter
 * @returns Array of filtered tasks
 */
export async function getTasksByTimeSensitivity(
  timeSensitivity: 'today' | 'this_week' | 'anytime'
): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('time_sensitivity', timeSensitivity)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TaskServiceError('获取任务列表失败', error.code, error)
    }

    if (!data) {
      return []
    }

    return data.map(rowToTask)
  } catch (error) {
    if (error instanceof TaskServiceError) {
      throw error
    }
    throw new TaskServiceError('获取任务列表时发生未知错误', undefined, error)
  }
}
