import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

async function fetchVersions() {}

async function fetchVersion(version: string) {
  const filePath = path.resolve(__dirname, `raw/versions/${version}.json`);

  try {
    await fs.access(filePath);
    console.log('Already fetched: ', version);
    return;
  } catch (err) {
    // Doesn't exist, continue
  }

  const url = `https://liquipedia.net/dota2/api.php?action=parse&format=json&page=Version_${version}&prop=text`;

  const response = await axios({
    method: 'get',
    url,
    responseType: 'text',
    transformResponse: (res) => res,
    headers: {
      'Accept-Encoding': 'gzip',
      'User-Agent':
        'dota-patch-trivia/0.1 (https://github.com/dogballs/; mradionov.oss@gmail.com)',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch: ${version}`);
  }

  const text = response.data;

  await fs.writeFile(filePath, text, 'utf8');
}

async function fetchImages() {}

fetchVersion('7.30c');
