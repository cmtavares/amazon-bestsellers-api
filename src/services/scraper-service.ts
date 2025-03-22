import puppeteer from 'puppeteer';
import { Product } from '../models/product';
import { v4 as uuidv4 } from 'uuid';

export async function scrapeAmazonBestsellers(): Promise<Product[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto('https://www.amazon.com.br/bestsellers', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.p13n-sc-uncoverable-faceout'));
      return items.slice(0, 3).map((item, index) => {
        const titleElement = item.querySelector('.p13n-sc-truncated') as HTMLElement;
        const priceElement = item.querySelector('.p13n-sc-price') as HTMLElement;
        const imageElement = item.querySelector('img') as HTMLImageElement;
        const linkElement = item.querySelector('a') as HTMLAnchorElement;
        const ratingElement = item.querySelector('.a-icon-alt') as HTMLElement;
        
        return {
          title: titleElement ? titleElement.innerText.trim() : 'Título não disponível',
          price: priceElement ? priceElement.innerText.trim() : 'Preço não disponível',
          imageUrl: imageElement ? imageElement.src : undefined,
          url: linkElement ? linkElement.href : undefined,
          rating: ratingElement ? ratingElement.innerText.trim() : undefined,
          rank: index + 1,
        };
      });
    });

    return products.map(product => ({
      ...product,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Erro ao fazer scraping dos produtos:', error);
    throw error;
  } finally {
    await browser.close();
  }
}