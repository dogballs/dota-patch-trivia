import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { createId } from '../lib/items';
import { Category, Item } from '../types/item';
import { XMLNode } from '../types/fast-xml-parser';

async function parseVersion(version: string) {
  const cards: Item[] = [];

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

  const builder = new XMLBuilder({
    preserveOrder: true,
  });

  const $nodes = $tree[0].div;

  let i = 0;

  let category: Category | 'initial' = 'initial';

  while (i < $nodes.length) {
    const $node = $nodes[i];

    if ($node.h2) {
      let $title = $node.h2[0].span[0];
      if (!$title) {
        $title = findDeepByKey($node, '#text');
      }
      if (!$title) {
        i++;
        continue;
      }

      const title = $title['#text'].trim().toLowerCase();

      switch (title) {
        case 'new heroes':
        case 'new hero':
          assert(['initial'].includes(category));
          category = 'new-hero';
          break;
        case 'general':
        case 'general updates':
        case 'general changes':
        case 'gameplay and cosmetics':
        case 'gameplay':
        case 'gameplay mechanics':
        case 'damage type changes':
        case 'hero talent tree':
        case 'backpack':
        case 'map changes':
        case 'illusions':
        case 'regeneration formula':
        case 'attribute changes':
        case 'talent trees':
        case 'talents':
        case 'outposts':
        case 'genetal updates':
        case 'gameplay updates':
        case "aghanim's shards":
        case 'neutral creep':
          assert(['initial', 'new-hero', 'hero', 'item'].includes(category));
          category = 'general';
          break;
        case 'bug fixes':
        case 'fixed bugs':
          assert(['initial', 'item', 'hero'].includes(category));
          category = 'bug-fix';
          break;
        case 'items':
        case 'item additions':
        case 'item changes':
          assert(
            ['initial', 'hero', 'item', 'new-item', 'neutral-item'].includes(
              category,
            ),
          );
          category = 'item';
          break;
        case 'neutral items':
          assert(['initial', 'item'].includes(category));
          category = 'neutral-item';
          break;
        case 'heroes':
        case 'hero changes':
          assert(
            [
              'initial',
              'new-hero',
              'item',
              'new-item',
              'neutral-item',
            ].includes(category),
          );
          category = 'hero';
          break;
        case 'new items':
          assert(['initial', 'hero', 'item'].includes(category));
          category = 'new-item';
          break;
        case 'external links':
        case 'misc':
        case 'additional content':
          break;
        default:
          throw new Error(`Unhandled section: ${title}`);
      }
    }

    if ($node.h3) {
      if (
        category === 'item' ||
        category === 'neutral-item' ||
        category === 'hero' ||
        category === 'new-item'
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

        const label = $title['#text'];

        cards.push({
          id: createId(version, category, label),
          version,
          category,
          label,
          descriptionHtml: builder.build([$list]),
          imageSrc,
        });

        i++;
      }

      if (category === 'new-hero') {
        const $title = findDeepByKey($node, '#text');
        const $img = findDeepByKey($node, 'img');

        assert($title !== undefined, 'No title');

        let imageSrc: string | undefined;
        if ($img !== undefined) {
          imageSrc = $img[':@']['@_src'];
        }

        const label = $title['#text'];

        cards.push({
          id: createId(version, category, label),
          version,
          category,
          label,
          descriptionHtml: '',
          imageSrc,
        });
      }
    }

    if ($node.ul) {
      if (category === 'general') {
        const label = 'General updates';
        cards.push({
          id: createId(version, category, label),
          version,
          category,
          label,
          descriptionHtml: builder.build([$node]),
        });
        category = 'initial';
      } else if (category === 'bug-fix') {
        const label = 'Bug fixes';
        cards.push({
          id: createId(version, category, label),
          version,
          category,
          label,
          descriptionHtml: builder.build([$node]),
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
    try {
      const $found = findDeepByKey($child, findKeyName);
      if ($found) {
        return $found;
      }
    } catch {
      return undefined;
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

    const isMajor = !!version.match(/^\d\.\d+$/);

    if (isMajor) {
      await parseVersion(version);
    }
  }
}

// parseAllFromRaw();

parseVersion('7.32');
