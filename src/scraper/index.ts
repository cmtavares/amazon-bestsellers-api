import { scrapeAmazonBestsellers } from "../services/scraper-service";
import { saveProduct } from "../services/dynamo-service";

async function runScraper() {
  try {
    console.log('Iniciando o scraper...');
    const products = await scrapeAmazonBestsellers();
    
    console.log(`Encontrados ${products.length} produtos.`);
    
    for (const product of products) {
      await saveProduct(product);
    }
    
    console.log('Scraping concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao executar o scraper:', error);
  }
}

runScraper();