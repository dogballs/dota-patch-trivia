import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { XMLNode } from '../types/fast-xml-parser';

type Caregory = 'general' | 'item' | 'neutral-item' | 'hero';

type Card = {
  version: string;
  category: Caregory;
  title: string;
  descriptionHtml: string;
  imageSrc?: string;
};

async function parseVersion(version: string) {
  const cards: Card[] = [];

  const jsonString = await fs.readFile(
    path.resolve(__dirname, `raw/versions/${version}.json`),
    'utf8',
  );
  const json = JSON.parse(jsonString);
  const text = json.parse.text['*'];

  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
  });
  const $tree = parser.parse(text);

  const builder = new XMLBuilder({});

  const $nodes = $tree[0].div;

  let i = 0;

  let category: Caregory | 'initial' = 'initial';

  while (i < $nodes.length) {
    const $node = $nodes[i];

    if ($node.h2) {
      const $title = $node.h2[0].span;
      const title = $title[0]['#text'].trim().toLowerCase();

      switch (title) {
        case 'general':
        case 'general updates':
          assert(category === 'initial');
          category = 'general';
          break;
        case 'items':
          assert(category === 'initial');
          category = 'item';
          break;
        case 'neutral items':
          assert(category === 'initial' || category === 'item');
          category = 'neutral-item';
          break;
        case 'heroes':
          assert(
            category === 'initial' ||
              category === 'item' ||
              category === 'neutral-item',
          );
          category = 'hero';
          break;
        case 'external links':
          break;
        default:
          throw new Error(`Unhandled section: ${title}`);
      }
    }

    if ($node.h3) {
      if (
        category === 'item' ||
        category === 'neutral-item' ||
        category === 'hero'
      ) {
        const $title = findDeepByKey($node, '#text');
        const $list = findNext($nodes, 'ul', i);
        const $img = findDeepByKey($node, 'img');

        let imageSrc: string | undefined;
        if ($img !== undefined) {
          imageSrc = $img[':@']['@_src'];
        }

        assert($title !== undefined, 'No title');
        assert($list !== undefined, 'No list');

        cards.push({
          version,
          category,
          title: $title['#text'],
          descriptionHtml: builder.build($list),
          imageSrc,
        });

        i++;
      }
    }

    if ($node.ul) {
      if (category === 'general') {
        cards.push({
          version,
          category: 'general',
          title: 'General updates',
          descriptionHtml: builder.build($node),
        });
        category = 'initial';
      }
    }

    i++;
  }

  const out = JSON.stringify(cards, null, 2);

  await fs.writeFile(
    path.resolve(__dirname, `done/versions/${version}.json`),
    out,
    'utf8',
  );
}

function findDeepByKey(
  $node: XMLNode,
  findKeyName: string,
): XMLNode | undefined {
  const keyName = Object.keys($node)[0];
  const $children = $node[keyName];

  if (keyName === findKeyName) {
    return $node;
  }

  for (const $child of $children) {
    const $found = findDeepByKey($child, findKeyName);
    if ($found) {
      return $found;
    }
  }

  return undefined;
}

function findNext(
  $nodes: XMLNode[],
  findKeyName: string,
  fromIndex: number,
): XMLNode | undefined {
  for (let i = fromIndex; i < $nodes.length; i++) {
    const $node = $nodes[i];
    const keyName = Object.keys($node)[0];
    if (keyName === findKeyName) {
      return $node;
    }
  }
  return undefined;
}

async function parseAllFromRaw() {
  const dirPath = path.resolve(__dirname, `raw/versions/`);

  const fileNames = await fs.readdir(dirPath);
  const jsonFileNames = fileNames.filter((fileName) =>
    fileName.endsWith('.json'),
  );

  for (const fileName of jsonFileNames) {
    const version = fileName.replace('.json', '');
    await parseVersion(version);
  }
}

parseAllFromRaw();

// parseVersion('7.30');
// parseVersion('7.30');
