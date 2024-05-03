// Importing necessary middleware from Middy
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';

// Importing getUserId function from utils module
import { getUserId } from '../utils.mjs';

// Importing deleteTodo function from todos business logic
import { deleteTodo } from '../../businessLogic/todos.mjs';

// Defining handler function with Middy middleware
export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    try {
      // Extracting todoId and userId from event
      const todoId = event.pathParameters.todoId;
      const userId = getUserId(event);

      // Deleting todo
      const deletedTodo = await deleteTodo(userId, todoId);

      // Returning HTTP response with success status code (200) and deleted todo
      return {
        statusCode: 200,
        body: JSON.stringify({
          deletedItem: deletedTodo
        })
      };
    } catch (error) {
      // Handling errors and returning appropriate status code and error message
      return {
        statusCode: error.statusCode || 500, // Default to 500 if no specific status code is provided
        body: JSON.stringify({
          error: error.message || 'Internal Server Error'
        })
      };
    }
  });
