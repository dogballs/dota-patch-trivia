import fs from 'fs/promises';
import path from 'path';

import { Item } from '../types/item';

async function combine() {
  const dirPath = path.resolve(__dirname, 'done/versions');

  const fileNames = await fs.readdir(dirPath);
  const jsonFileNames = fileNames.filter((fileName) =>
    fileName.endsWith('.json'),
  );

  const cards = [];

  for (const fileName of jsonFileNames) {
    const filePath = path.join(dirPath, fileName);

    const text = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(text);

    const filtered = json.filter((item: Item) => {
      return item.category !== 'bug-fix';
    });

    cards.push(...filtered);
  }

  const combinedText = JSON.stringify(cards);
  // const combinedText = JSON.stringify(cards, null, 2);

  // const combinedFilePath = path.resolve(__dirname, 'done/combined.json');
  const combinedFilePath = path.resolve(__dirname, '../public/combined.json');
  await fs.writeFile(combinedFilePath, combinedText, 'utf8');
}

combine();
