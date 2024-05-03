// Importing necessary middleware from Middy
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';

// Importing getUserId function from utils module
import { getUserId } from '../utils.mjs';

// Importing fetchListByUserID function from todos business logic
import { fetchListByUserID } from '../../businessLogic/todos.mjs';

// Defining handler function with Middy middleware
export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    try {
      // Getting user ID from event
      const userId = getUserId(event);
      
      // Fetching todos list for the user
      const todos = await fetchListByUserID(userId);

      // Returning HTTP response with success status code (200) and todos list
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
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
