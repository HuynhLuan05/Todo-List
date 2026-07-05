import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';

const router = Router();

// Create a new todo
router.post('/', TodoController.createTodo);

// Retrieve all todos (with pagination, search, sorting, filtering)
router.get('/', TodoController.getTodos);

// Get a single todo by ID
router.get('/:id', TodoController.getTodoById);

// Update a todo by ID
router.put('/:id', TodoController.updateTodo);

// Toggle the completion status of a todo by ID
router.patch('/:id/toggle', TodoController.toggleTodoStatus);

// Delete a todo by ID
router.delete('/:id', TodoController.deleteTodo);

export default router;
