export type Category =
  | 'new-hero'
  | 'new-item'
  | 'general'
  | 'bug-fix'
  | 'item'
  | 'neutral-item'
  | 'hero';

export interface Item {
  id: string;
  version: string;
  category: Category;
  label: string;
  descriptionHtml: string;
  imageSrc?: string;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
  };
};
