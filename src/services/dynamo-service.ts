import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { Product } from '../models/product';

const client = new DynamoDBClient({
  region: 'us-east-1',
  ...(process.env.IS_OFFLINE && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'DEFAULT_ACCESS_KEY',
      secretAccessKey: 'DEFAULT_SECRET'
    }
  })
});

const docClient = DynamoDBDocumentClient.from(client);
const TableName = process.env.DYNAMODB_TABLE || 'amazon-bestsellers-api-dev';

export const saveProduct = async (product: Product): Promise<void> => {
  const params = {
    TableName,
    Item: product
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log(`Product saved: ${product.id}`);
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  const params = {
    TableName
  };

  try {
    const data = await docClient.send(new ScanCommand(params));
    return (data.Items as Product[]) || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};