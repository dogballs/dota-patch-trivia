import { Item, PlayedItem, Category } from '../types/item';

export function getRandomItem(deck: Item[], played: Item[]): Item {
  const playedVersions = played.map((item) => item.version);

  const nonPlayed = deck.filter((item) => {
    return !playedVersions.includes(item.version);
  });

  let item = nonPlayed[Math.floor(Math.random() * nonPlayed.length)];

  let i;
  for (i = 0; i < 20; i++) {
    if (tooClose(item, played)) {
      item = nonPlayed[Math.floor(Math.random() * nonPlayed.length)];
    } else {
      break;
    }
  }

  return item;
}

function tooClose(item: Item, played: Item[]) {
  let distance = played.length <= 5 ? 0.06 : 0.03;
  if (played.length > 10) distance = 0.01;

  const hasCloseItems = played.some((p) => {
    const playedVersionNumber = Number(p.version);
    const itemVersionNumber = Number(item.version);
    return Math.abs(playedVersionNumber - itemVersionNumber) < distance;
  });

  return hasCloseItems;
}

export function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number,
): { correct: boolean; delta: number } {
  const sorted = [...played, item].sort((a, b) =>
    compareVersions(a.version, b.version),
  );
  const correctIndex = sorted.findIndex((i) => {
    return i.id === item.id;
  });

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

function compareVersions(v1: string, v2: string) {
  const p1 = parseVersion(v1);
  const p2 = parseVersion(v2);

  if (p1.major < p2.major) return -1;
  if (p1.major > p2.major) return 1;

  if (p1.minor < p2.minor) return -1;
  if (p1.minor > p2.minor) return 1;

  if (p1.patch < p2.patch) return -1;
  if (p1.patch > p2.patch) return 1;

  return 0;
}

function parseVersion(version: string) {
  const parts = version.split('.');

  const major = Number(parts[0]);
  const minor = parseInt(parts[1], 10);

  // Empty string if no patch, it will be less than a character when comparing
  // ('' < 'a') // true
  const patch = version.replace(`${major}.${minor}`, '');

  return {
    major,
    minor,
    patch,
  };
}

export function createId(
  version: string,
  category: Category,
  label: string,
  index?: number,
) {
  const parts = [version, category, label];
  if (index !== undefined) {
    parts.push(index.toString());
  }
  return parts.join('_').replace(/\s+/g, '-');
}

export function flattenImageSrc(imageSrc: string) {
  return imageSrc
    .replace(/\//g, '_')
    .replaceAll('%27', "'")
    .replaceAll('%28', '(')
    .replaceAll('%29', ')');
}

export function createImageUrl(imageSrc: string) {
  const flatName = flattenImageSrc(imageSrc);
  return `fetched/${flatName}`;
}

export function preloadImage(
  imageSrc: string | undefined,
): HTMLImageElement | undefined {
  if (imageSrc === undefined) {
    return undefined;
  }
  const img = new Image();
  img.src = createImageUrl(imageSrc);
  return img;
}
