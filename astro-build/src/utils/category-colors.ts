// Simplified brand-unified color scheme for visual consistency
// All selected categories use the same violet scheme for cohesive brand identity

export function getCategoryButtonClass(_category: string, isSelected: boolean): string {
  if (!isSelected) {
    return 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-athletic-brand-violet/50 hover:text-white';
  }

  // Brand-unified violet scheme for all selected categories
  return 'bg-athletic-brand-violet/10 border-athletic-brand-violet/30 text-athletic-brand-violet';
}

export function getCategoryColors(_category?: string) {
  // Brand-unified violet scheme for all categories
  return {
    bg: 'bg-athletic-brand-violet/10',
    border: 'border-athletic-brand-violet/30',
    text: 'text-athletic-brand-violet',
  };
}
