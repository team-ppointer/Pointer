export { default as TooltipPopover } from './TooltipPopover';
export type { TooltipPopoverProps } from './TooltipPopover';

export { ScrapItemTooltip, ItemTooltip } from './ScrapItemTooltip';
export type { ScrapItemTooltipProps, ItemTooltipProps } from './ScrapItemTooltip';

export { AddScrapTooltip, AddItemTooltip } from './AddScrapTooltip';
export type { AddScrapTooltipProps, AddItemTooltipProps } from './AddScrapTooltip';

export { ReviewScrapTooltip, ReviewItemTooltip } from './ReviewScrapTooltip';
export type { ReviewScrapTooltipProps, ReviewItemTooltipProps } from './ReviewScrapTooltip';

export { TrashScrapTooltip, TrashItemTooltip } from './TrashScrapTooltip';
export type { TrashScrapTooltipProps, TrashItemTooltipProps } from './TrashScrapTooltip';

// 하위 호환성을 위한 별칭 export
export { ScrapItemTooltip as ItemTooltipBox } from './ScrapItemTooltip';
export { AddScrapTooltip as AddItemTooltipBox } from './AddScrapTooltip';
export { ReviewScrapTooltip as ReviewItemTooltipBox } from './ReviewScrapTooltip';
export { TrashScrapTooltip as TrashItemTooltipBox } from './TrashScrapTooltip';
