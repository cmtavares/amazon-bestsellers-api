import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getAllProducts } from "../services/dynamo-service";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const products = await getAllProducts();
    
    const sortedProducts = products.sort((a, b) => a.rank - b.rank);
    
    const topProducts = sortedProducts.slice(0, 3);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        products: topProducts,
        count: topProducts.length,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Erro interno ao processar a requisição',
        error: process.env.IS_OFFLINE ? error : 'Internal server error'
      })
    };
  }
};