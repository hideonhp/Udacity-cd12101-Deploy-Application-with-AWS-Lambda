// Importing necessary middleware from Middy
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';

// Importing getUserId function from utils module
import { getUserId } from '../utils.mjs';

// Importing createTodo function from todos business logic
import { createTodo } from '../../businessLogic/todos.mjs';

// Defining handler function with Middy middleware
export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    try {
      // Parsing todo data from request body
      const todoData = JSON.parse(event.body || '');
      // Getting user ID from event
      const userId = getUserId(event);   
      // Creating new todo
      const newTodo = await createTodo(userId, todoData);

      // Returning HTTP response with success status code (201) and created todo
      return {
        statusCode: 201,
        body: JSON.stringify({
          item: newTodo
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
