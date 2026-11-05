import { forwardRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement, HugeiconsProps } from '@hugeicons/react';
import * as H from '@hugeicons/core-free-icons';

export interface IconProps extends Omit<HugeiconsProps, 'icon'> {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export function createIcon(svgIcon: IconSvgElement, displayName?: string) {
  const Component = forwardRef<SVGSVGElement, IconProps>(
    ({ className, size = 20, strokeWidth = 1.5, ...props }, ref) => {
      return (
        <HugeiconsIcon
          ref={ref}
          icon={svgIcon}
          size={size}
          strokeWidth={strokeWidth}
          className={className}
          {...props}
        />
      );
    }
  );
  if (displayName) Component.displayName = displayName;
  return Component;
}

// ──────────────── Navigation & Workspaces ────────────────
export const DashboardIcon = createIcon(H.DashboardSquare01Icon, 'DashboardIcon');
export const PenLineIcon = createIcon(H.PencilEdit02Icon, 'PenLineIcon');
export const CalendarIcon = createIcon(H.Calendar03Icon, 'CalendarIcon');
export const AnalyticsIcon = createIcon(H.Analytics01Icon, 'AnalyticsIcon');
export const HistoryIcon = createIcon(H.HistoryIcon, 'HistoryIcon');
export const CalculatorIcon = createIcon(H.Calculator01Icon, 'CalculatorIcon');
export const TimeWindowIcon = createIcon(H.CalendarClockIcon, 'TimeWindowIcon');
export const ShieldCheckIcon = createIcon(H.ShieldCheckIcon, 'ShieldCheckIcon');
export const AlertTriangleIcon = createIcon(H.Alert02Icon, 'AlertTriangleIcon');
export const AlertCircleIcon = createIcon(H.AlertCircleIcon, 'AlertCircleIcon');
export const SemestersIcon = createIcon(H.GraduationCapIcon, 'SemestersIcon');
export const SettingsIcon = createIcon(H.Settings02Icon, 'SettingsIcon');

// ──────────────── Subjects & Analytics Metrics ────────────────
export const BookOpenIcon = createIcon(H.BookOpen01Icon, 'BookOpenIcon');
export const FlaskConicalIcon = createIcon(H.FlaskConicalIcon, 'FlaskConicalIcon');
export const GraduationCapIcon = createIcon(H.GraduationCapIcon, 'GraduationCapIcon');
export const TargetIcon = createIcon(H.Target02Icon, 'TargetIcon');
export const TrendingUpIcon = createIcon(H.TrendingUpIcon, 'TrendingUpIcon');
export const TrendingDownIcon = createIcon(H.TrendingDownIcon, 'TrendingDownIcon');

// ──────────────── Chevrons & Directional Controls ────────────────
export const ChevronRightIcon = createIcon(H.ChevronRightIcon, 'ChevronRightIcon');
export const ChevronLeftIcon = createIcon(H.ChevronLeftIcon, 'ChevronLeftIcon');
export const ChevronDownIcon = createIcon(H.ChevronDownIcon, 'ChevronDownIcon');
export const ChevronUpIcon = createIcon(H.ChevronUpIcon, 'ChevronUpIcon');
export const ArrowUpIcon = createIcon(H.ArrowUp01Icon, 'ArrowUpIcon');
export const CheckCircleIcon = createIcon(H.CheckmarkCircle01Icon, 'CheckCircleIcon');

// ──────────────── Actions & Editing ────────────────
export const PlusIcon = createIcon(H.Add01Icon, 'PlusIcon');
export const MinusIcon = createIcon(H.MinusSignIcon, 'MinusIcon');
export const CheckIcon = createIcon(H.Tick01Icon, 'CheckIcon');
export const CloseIcon = createIcon(H.Cancel01Icon, 'CloseIcon');
export const TrashIcon = createIcon(H.Delete02Icon, 'TrashIcon');
export const SaveIcon = createIcon(H.FloppyDiskIcon, 'SaveIcon');
export const EditIcon = createIcon(H.PencilEdit01Icon, 'EditIcon');
export const RotateCcwIcon = createIcon(H.RotateCcwIcon, 'RotateCcwIcon');
export const CopyIcon = createIcon(H.Copy01Icon, 'CopyIcon');
export const ShareIcon = createIcon(H.Share01Icon, 'ShareIcon');
export const DownloadIcon = createIcon(H.Download01Icon, 'DownloadIcon');
export const LogoutIcon = createIcon(H.Logout01Icon, 'LogoutIcon');
export const ClockIcon = createIcon(H.Clock01Icon, 'ClockIcon');
export const StickyNoteIcon = createIcon(H.StickyNote01Icon, 'StickyNoteIcon');
export const SearchIcon = createIcon(H.Search01Icon, 'SearchIcon');
export const SendIcon = createIcon(H.SendIcon, 'SendIcon');
export const GripVerticalIcon = createIcon(H.GripVerticalIcon, 'GripVerticalIcon');
export const PowerIcon = createIcon(H.PowerIcon, 'PowerIcon');
export const ExternalLinkIcon = createIcon(H.ExternalLinkIcon, 'ExternalLinkIcon');
export const GithubIcon = createIcon(H.GithubIcon, 'GithubIcon');

// ──────────────── Appearance & Shell ────────────────
export const SunIcon = createIcon(H.Sun01Icon, 'SunIcon');
export const MoonIcon = createIcon(H.Moon02Icon, 'MoonIcon');
export const MonitorIcon = createIcon(H.ComputerIcon, 'MonitorIcon');
export const MenuIcon = createIcon(H.Menu01Icon, 'MenuIcon');
export const MoreHorizontalIcon = createIcon(H.MoreHorizontalIcon, 'MoreHorizontalIcon');
export const HeartPulseIcon = createIcon(H.HeartPulseIcon, 'HeartPulseIcon');

export { HugeiconsIcon };
export type { IconSvgElement, HugeiconsProps };
