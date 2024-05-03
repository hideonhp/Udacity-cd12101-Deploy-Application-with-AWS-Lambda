// Importing uuid library
import * as uuid from 'uuid';

// Importing TodosAccess class from dataLayer
import { TodosAccess } from '../dataLayer/todosAccess.mjs';

// Importing createLogger function from logger utility
import { createLogger } from '../utils/logger.mjs';

// Importing getUploadUrl function from attachmentUtils
import { getUploadUrl } from '../fileStorage/attachmentUtils.mjs';

// Creating an instance of TodosAccess class
const todosAccess = new TodosAccess();

// Creating logger with 'Todos' tag
const logger = createLogger('Todos');

// Getting the S3 bucket name from environment variables
const bucketName = process.env.TW_S3_BUCKET;

// Function to fetch todos list by userID
export const fetchListByUserID = async (userId) => {
  try {
    return todosAccess.getTodos(userId);
  } catch (error) {
    logger.error('Error fetching todos: ', error.message);
    throw new Error('Cannot fetch todos');
  }
};

// Function to create a new todo
export const createTodo = async (userId, todoData) => {
  try {
    // Generating a unique todo ID
    const todoId = uuid.v4();
    // Adding userId and generated todoId to todoData
    todoData = {
      userId: userId,
      todoId: todoId,
      ...todoData
    };
    return todosAccess.createTodo(todoData);
  } catch (error) {
    logger.error('Error creating todo: ', error.message);
    throw new Error('Cannot create todo');
  }
};

// Function to update a todo
export const updateTodo = async (userId, todoId, updateTodoData) => {
  try {
    return todosAccess.updateTodo(userId, todoId, updateTodoData);
  } catch (error) {
    logger.error('Error updating todo: ', error.message);
    throw new Error('Cannot update todo');
  }
};

// Function to delete a todo
export const deleteTodo = async (userId, todoId) => {
  try {
    return todosAccess.deleteTodo(userId, todoId);
  } catch (error) {
    logger.error('Error deleting todo: ', error.message);
    throw new Error('Cannot delete todo');
  }
};

// Function to update todo attachment
export const updateTodoAttachment = async (userId, todoId) => {
  try {
    // Generating a unique attachment ID
    const attachmentId = uuid.v4();
    // Getting signed URL for uploading attachment
    const s3SignedUrl = await getUploadUrl(attachmentId);
    // Constructing attachment URL
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`;
    // Updating todo with attachment URL
    await todosAccess.updateTodoAttachment(userId, todoId, attachmentUrl);

    return s3SignedUrl;
  } catch (error) {
    logger.error('Error updating attachment: ', error.message);
    throw new Error('Cannot update attachment');
  }
};
