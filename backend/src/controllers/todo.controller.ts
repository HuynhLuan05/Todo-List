import { Request, Response, NextFunction } from 'express';
import { TodoService } from '../services/todo.service';
import { createTodoSchema, updateTodoSchema, queryTodoSchema } from '../schemas/todo.schema';

export class TodoController {
  /**
   * Create a new todo
   */
  static async createTodo(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const parsedBody = createTodoSchema.parse(req.body);
      
      const newTodo = await TodoService.createTodo(parsedBody);
      
      return res.status(201).json({
        success: true,
        message: 'Tạo công việc thành công',
        data: newTodo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all todos with search, filter, and pagination
   */
  static async getTodos(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate and parse query parameters
      const parsedQuery = queryTodoSchema.parse(req.query);
      
      const result = await TodoService.getTodos(parsedQuery);
      
      return res.status(200).json({
        success: true,
        data: result.todos,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detail of a specific todo by ID
   */
  static async getTodoById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const todo = await TodoService.getTodoById(id);
      
      if (!todo) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy công việc',
        });
      }

      return res.status(200).json({
        success: true,
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a todo by ID
   */
  static async updateTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Validate request body
      const parsedBody = updateTodoSchema.parse(req.body);
      
      const updatedTodo = await TodoService.updateTodo(id, parsedBody);
      
      if (!updatedTodo) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy công việc để cập nhật',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật công việc thành công',
        data: updatedTodo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle completed status of a todo by ID
   */
  static async toggleTodoStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const updatedTodo = await TodoService.toggleTodoStatus(id);
      
      if (!updatedTodo) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy công việc để cập nhật trạng thái',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái công việc thành công',
        data: updatedTodo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a todo by ID
   */
  static async deleteTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const deletedTodo = await TodoService.deleteTodo(id);
      
      if (!deletedTodo) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy công việc để xóa',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Xóa công việc thành công',
        data: deletedTodo,
      });
    } catch (error) {
      next(error);
    }
  }
}
