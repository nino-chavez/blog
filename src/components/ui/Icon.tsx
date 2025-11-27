/**
 * Icon abstraction component for Signal Dispatch
 * Provides unified interface for Phosphor Icons with weight-based visual hierarchy
 */

import type { IconWeight } from '@phosphor-icons/react';
import type { ComponentType } from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconEmphasis = 'subtle' | 'normal' | 'strong' | 'accent';

const sizeMap: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const emphasisMap: Record<IconEmphasis, IconWeight> = {
  subtle: 'thin',
  normal: 'regular',
  strong: 'bold',
  accent: 'duotone',
};

interface IconProps {
  icon: ComponentType<{ size?: number; weight?: IconWeight; className?: string }>;
  size?: IconSize;
  emphasis?: IconEmphasis;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export function Icon({
  icon: IconComponent,
  size = 'md',
  emphasis = 'normal',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: IconProps) {
  return (
    <IconComponent
      size={sizeMap[size]}
      weight={emphasisMap[emphasis]}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? !ariaLabel}
    />
  );
}

// Re-export commonly used icons for convenience
export {
  // Navigation
  List as MenuIcon,
  X as CloseIcon,
  House as HomeIcon,
  MagnifyingGlass as SearchIcon,
  ArrowLeft as BackIcon,
  ArrowRight as ForwardIcon,

  // Social
  LinkedinLogo as LinkedInIcon,
  GithubLogo as GitHubIcon,
  TwitterLogo as TwitterIcon,
  XLogo as XIcon,
  InstagramLogo as InstagramIcon,
  Envelope as EmailIcon,
  Link as LinkIcon,

  // Content
  Article as ArticleIcon,
  BookOpen as BookIcon,
  Tag as TagIcon,
  Folder as FolderIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Eye as ViewIcon,

  // Actions
  Share as ShareIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  ArrowUp as ArrowUpIcon,

  // Categories (Signal Dispatch specific)
  Brain as AIIcon,
  Lightning as AutomationIcon,
  Users as LeadershipIcon,
  ChartLine as StrategyIcon,
  Camera as PhotographyIcon,
  Lightbulb as InsightIcon,
  Sparkle as MetaIcon,
  Code as CodeIcon,
  Gear as SystemsIcon,

  // Feedback
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  XCircle as ErrorIcon,

  // Misc
  Rss as RssIcon,
  Moon as DarkModeIcon,
  Sun as LightModeIcon,
  CaretDown as ChevronDownIcon,
  CaretUp as ChevronUpIcon,
  CaretRight as ChevronRightIcon,

} from '@phosphor-icons/react';
