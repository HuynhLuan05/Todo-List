import prisma from './db';
import { CreateTodoInput, UpdateTodoInput, QueryTodoInput } from '../schemas/todo.schema';

export class TodoService {
  /**
   * Create a new todo item
   */
  static async createTodo(data: CreateTodoInput) {
    return prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: 'pending',
      },
    });
  }

  /**
   * Retrieve a list of todos with search, filtering, pagination, and sorting
   */
  static async getTodos(query: QueryTodoInput) {
    const { search, status, sortBy, sortOrder, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build filter and search conditions
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }

    // Count total number of items matching the conditions
    const totalCount = await prisma.todo.count({ where });

    // Fetch paginated results
    const todos = await prisma.todo.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      todos,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  /**
   * Get a single todo item by ID
   */
  static async getTodoById(id: string) {
    return prisma.todo.findUnique({
      where: { id },
    });
  }

  /**
   * Update a todo item by ID
   */
  static async updateTodo(id: string, data: UpdateTodoInput) {
    // Check if the todo item exists
    const existing = await this.getTodoById(id);
    if (!existing) return null;

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    return prisma.todo.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Toggle the completion status (pending <-> completed)
   */
  static async toggleTodoStatus(id: string) {
    const existing = await this.getTodoById(id);
    if (!existing) return null;

    const newStatus = existing.status === 'completed' ? 'pending' : 'completed';

    return prisma.todo.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  /**
   * Delete a todo item by ID
   */
  static async deleteTodo(id: string) {
    const existing = await this.getTodoById(id);
    if (!existing) return null;

    return prisma.todo.delete({
      where: { id },
    });
  }
}
