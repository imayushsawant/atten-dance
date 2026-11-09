import { forwardRef } from 'react';
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react';
import * as P from '@phosphor-icons/react';

export interface IconProps extends Omit<PhosphorIconProps, 'ref'> {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export function createPhosphorIcon(
  IconComponent: React.ComponentType<PhosphorIconProps>,
  displayName?: string
) {
  const Component = forwardRef<SVGSVGElement, IconProps>(
    ({ className, size = 20, strokeWidth, ...props }, ref) => {
      // Map strokeWidth to weight if desired: strokeWidth >= 2 => bold, etc.
      const weight = props.weight || (strokeWidth && strokeWidth >= 2 ? 'bold' : 'regular');
      return (
        <IconComponent
          ref={ref as any}
          size={size}
          weight={weight}
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
export const DashboardIcon = createPhosphorIcon(P.SquaresFour, 'DashboardIcon');
export const PenLineIcon = createPhosphorIcon(P.PencilSimpleLine, 'PenLineIcon');
export const CalendarIcon = createPhosphorIcon(P.CalendarBlank, 'CalendarIcon');
export const AnalyticsIcon = createPhosphorIcon(P.ChartBar, 'AnalyticsIcon');
export const HistoryIcon = createPhosphorIcon(P.ClockCounterClockwise, 'HistoryIcon');
export const CalculatorIcon = createPhosphorIcon(P.Calculator, 'CalculatorIcon');
export const TimeWindowIcon = createPhosphorIcon(P.Hourglass, 'TimeWindowIcon');
export const ShieldCheckIcon = createPhosphorIcon(P.ShieldCheck, 'ShieldCheckIcon');
export const AlertTriangleIcon = createPhosphorIcon(P.Warning, 'AlertTriangleIcon');
export const AlertCircleIcon = createPhosphorIcon(P.WarningCircle, 'AlertCircleIcon');
export const SemestersIcon = createPhosphorIcon(P.GraduationCap, 'SemestersIcon');
export const SettingsIcon = createPhosphorIcon(P.Gear, 'SettingsIcon');

// ──────────────── Subjects & Analytics Metrics ────────────────
export const BookOpenIcon = createPhosphorIcon(P.BookOpen, 'BookOpenIcon');
export const FlaskConicalIcon = createPhosphorIcon(P.Flask, 'FlaskConicalIcon');
export const GraduationCapIcon = createPhosphorIcon(P.GraduationCap, 'GraduationCapIcon');
export const TargetIcon = createPhosphorIcon(P.Target, 'TargetIcon');
export const TrendingUpIcon = createPhosphorIcon(P.TrendUp, 'TrendingUpIcon');
export const TrendingDownIcon = createPhosphorIcon(P.TrendDown, 'TrendingDownIcon');

// ──────────────── Chevrons & Directional Controls ────────────────
export const ChevronRightIcon = createPhosphorIcon(P.CaretRight, 'ChevronRightIcon');
export const ChevronLeftIcon = createPhosphorIcon(P.CaretLeft, 'ChevronLeftIcon');
export const ChevronDownIcon = createPhosphorIcon(P.CaretDown, 'ChevronDownIcon');
export const ChevronUpIcon = createPhosphorIcon(P.CaretUp, 'ChevronUpIcon');
export const ArrowUpIcon = createPhosphorIcon(P.ArrowUp, 'ArrowUpIcon');
export const ArrowDownIcon = createPhosphorIcon(P.ArrowDown, 'ArrowDownIcon');
export const CheckCircleIcon = createPhosphorIcon(P.CheckCircle, 'CheckCircleIcon');

// ──────────────── Actions & Editing ────────────────
export const PlusIcon = createPhosphorIcon(P.Plus, 'PlusIcon');
export const MinusIcon = createPhosphorIcon(P.Minus, 'MinusIcon');
export const CheckIcon = createPhosphorIcon(P.Check, 'CheckIcon');
export const CloseIcon = createPhosphorIcon(P.X, 'CloseIcon');
export const TrashIcon = createPhosphorIcon(P.Trash, 'TrashIcon');
export const SaveIcon = createPhosphorIcon(P.FloppyDisk, 'SaveIcon');
export const EditIcon = createPhosphorIcon(P.PencilSimple, 'EditIcon');
export const RotateCcwIcon = createPhosphorIcon(P.ArrowCounterClockwise, 'RotateCcwIcon');
export const CopyIcon = createPhosphorIcon(P.Copy, 'CopyIcon');
export const ShareIcon = createPhosphorIcon(P.ShareNetwork, 'ShareIcon');
export const DownloadIcon = createPhosphorIcon(P.DownloadSimple, 'DownloadIcon');
export const LogoutIcon = createPhosphorIcon(P.SignOut, 'LogoutIcon');
export const ClockIcon = createPhosphorIcon(P.Clock, 'ClockIcon');
export const StickyNoteIcon = createPhosphorIcon(P.Note, 'StickyNoteIcon');
export const SearchIcon = createPhosphorIcon(P.MagnifyingGlass, 'SearchIcon');
export const SendIcon = createPhosphorIcon(P.PaperPlaneTilt, 'SendIcon');
export const GripVerticalIcon = createPhosphorIcon(P.DotsSixVertical, 'GripVerticalIcon');
export const PowerIcon = createPhosphorIcon(P.Power, 'PowerIcon');
export const ExternalLinkIcon = createPhosphorIcon(P.ArrowSquareOut, 'ExternalLinkIcon');
export const GithubIcon = createPhosphorIcon(P.GithubLogo, 'GithubIcon');

// ──────────────── Appearance & Shell ────────────────
export const SunIcon = createPhosphorIcon(P.Sun, 'SunIcon');
export const MoonIcon = createPhosphorIcon(P.Moon, 'MoonIcon');
export const MonitorIcon = createPhosphorIcon(P.Desktop, 'MonitorIcon');
export const MenuIcon = createPhosphorIcon(P.List, 'MenuIcon');
export const MoreHorizontalIcon = createPhosphorIcon(P.DotsThree, 'MoreHorizontalIcon');
export const HeartPulseIcon = createPhosphorIcon(P.Heartbeat, 'HeartPulseIcon');

export { Logo } from '@/components/logo';
