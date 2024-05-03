// Importing DynamoDB client from AWS SDK
import { DynamoDB } from '@aws-sdk/client-dynamodb';

// Importing DynamoDBDocument module from AWS SDK
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

// Importing AWSXRay module
import AWSXRay from 'aws-xray-sdk-core';

// Defining TodosAccess class for accessing Todos data
export class TodosAccess {
  constructor(
    // Capturing DynamoDB client with X-Ray
    dynaDb = AWSXRay.captureAWSv3Client(new DynamoDB()),
    // Getting Todos table name from environment variables
    tdsTab = process.env.TODOS_TABLE
  ) {
    this.tdsTab = tdsTab;
    this.dynaDb = dynaDb;
    // Creating DynamoDBDocument client from captured client
    this.dynaDbClient = DynamoDBDocument.from(this.dynaDb);
  }

  // Function to get todos for a specific userId
  async getTodos(userId) {
    const params = {
      TableName: this.tdsTab,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const result = await this.dynaDbClient.query(params);
    return result.Items;
  }

  // Function to create a new todo
  async createTodo(todoData) {
    const params = {
      TableName: this.tdsTab,
      Item: todoData
    };

    await this.dynaDbClient.put(params);
    return todoData;
  }

  // Function to update a todo
  async updateTodo(userId, todoId, updateTodoData) {
    const params = {
      TableName: this.tdsTab,
      Key: { userId, todoId },
      UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':name': updateTodoData.name,
        ':dueDate': updateTodoData.dueDate,
        ':done': updateTodoData.done
      },
      ReturnValues: 'ALL_NEW'
    };

    await this.dynaDbClient.update(params);
    return {
      userId: userId,
      todoId: todoId,
      ...updateTodoData
    };
  }

  // Function to delete a todo
  async deleteTodo(userId, todoId) {
    const params = {
      TableName: this.tdsTab,
      Key: { userId, todoId },
      ReturnValues: 'ALL_OLD'
    };

    return await this.dynaDbClient.delete(params);
  }

  // Function to update todo attachment
  async updateTodoAttachment(userId, todoId, attUrl) {
    const params = {
      TableName: this.tdsTab,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attUrl
      },      
      ReturnValues: 'ALL_NEW'
    };

    return await this.dynaDbClient.update(params);
  }
}
