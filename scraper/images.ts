import fs from 'fs/promises';
import fsOld from 'fs';
import path from 'path';
import assert from 'assert';

import axios from 'axios';

import { flattenImageSrc } from '../lib/items';
import { Item } from '../types/item';
import { COMMON_HEADERS } from './headers';

const FETCH_DELAY = 5000; // 30 sec

async function fetchImagesForVersion(version: string) {
  const filePath = path.resolve(__dirname, `done/versions/${version}.json`);
  const text = await fs.readFile(filePath, 'utf8');
  const json = JSON.parse(text);

  const itemsWithImages: Item[] = [];

  json.forEach((item: Item) => {
    if (item.imageSrc) {
      itemsWithImages.push(item);
    }
  });

  let i = 0;
  for (const item of itemsWithImages) {
    assert(item.imageSrc !== undefined);
    i++;

    const flatFileName = flattenImageSrc(item.imageSrc);

    const writeFilePath = path.resolve(
      __dirname,
      '../public/fetched',
      flatFileName,
    );

    try {
      await fs.access(writeFilePath);
      console.log(
        '[%d/%d] Already fetched: ',
        i,
        itemsWithImages.length,
        flatFileName,
      );
      continue;
    } catch (err) {
      // Doesn't exist, continue
    }

    const url = `https://liquipedia.net${item.imageSrc}`;

    console.log('[%d/%d] Fetching: %s', i, itemsWithImages.length, url);

    // Don't spam the API
    await delay(FETCH_DELAY);

    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      headers: {
        ...COMMON_HEADERS,
      },
    });

    response.data.pipe(fsOld.createWriteStream(writeFilePath));
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

fetchImagesForVersion('7.31');
