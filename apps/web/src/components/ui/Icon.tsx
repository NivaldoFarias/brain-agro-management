/**
 * Icon system using lucide-react.
 *
 * Provides a curated set of icons used throughout the application.
 * All icons are tree-shakeable and optimized for performance.
 *
 * @example
 * ```tsx
 * import { PlusIcon, TrashIcon, EditIcon } from "@/components/ui/Icon";
 *
 * <Button>
 *   <PlusIcon size={16} />
 *   Create
 * </Button>
 * ```
 */

// Re-export commonly used icons from lucide-react
export {
	Plus as PlusIcon,
	Trash2 as TrashIcon,
	Edit as EditIcon,
	Search as SearchIcon,
	X as CloseIcon,
	Check as CheckIcon,
	AlertCircle as AlertIcon,
	Info as InfoIcon,
	ChevronDown as ChevronDownIcon,
	ChevronUp as ChevronUpIcon,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	MoreVertical as MoreIcon,
	Eye as EyeIcon,
	EyeOff as EyeOffIcon,
	Calendar as CalendarIcon,
	MapPin as MapPinIcon,
	Loader2 as SpinnerIcon,
	AlertTriangle as WarningIcon,
	CheckCircle as SuccessIcon,
	XCircle as ErrorIcon,
	Sprout as CropIcon,
	Factory as FarmIcon,
	User as UserIcon,
	Users as UsersIcon,
	BarChart3 as ChartIcon,
	PieChart as PieChartIcon,
	TrendingUp as TrendingUpIcon,
	Filter as FilterIcon,
	Download as DownloadIcon,
	Upload as UploadIcon,
	RefreshCw as RefreshIcon,
	Settings as SettingsIcon,
	LogOut as LogOutIcon,
	Home as HomeIcon,
	Menu as MenuIcon,
} from "lucide-react";

/**
 * Default icon size constants for consistent sizing.
 */
export const IconSize = {
	xs: 12,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 32,
} as const;
