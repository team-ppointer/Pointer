import { TagType } from '@types';

export const tagToQueryParams = (tags: TagType[]) => {
  if (!tags.length) return {};
  return { conceptTagIds: tags.map((tag) => tag.id) };
};
