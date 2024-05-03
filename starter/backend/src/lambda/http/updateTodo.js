// Importing necessary middleware from Middy
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';

// Importing getUserId function from utils module
import { getUserId } from '../utils.mjs';

// Importing updateTodo function from todos business logic
import { updateTodo } from '../../businessLogic/todos.mjs';

// Defining handler function with Middy middleware
export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    try {
      // Logging caller event
      console.log('Caller event', event);

      // Extracting todoId and updateTodoData from event
      const todoId = event.pathParameters.todoId;
      const updateTodoData = JSON.parse(event.body || '');

      // Getting user ID from event
      const userId = getUserId(event);
      
      // Updating todo
      const updatedTodo = await updateTodo(userId, todoId, updateTodoData);

      // Returning HTTP response with success status code (200) and updated todo
      return {
        statusCode: 200,
        body: JSON.stringify({
          item: updatedTodo
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
