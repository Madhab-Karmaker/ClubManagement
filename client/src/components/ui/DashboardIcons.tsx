import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

const SvgIcon: React.FC<React.PropsWithChildren<IconProps>> = ({ title, className, children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : true}
    role={title ? "img" : "presentation"}
    className={className}
    {...props}
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M4 10.5 12 4l8 6.5" /><path d="M6.5 9.75V20h11V9.75" /><path d="M10 20v-5h4v5" /></SvgIcon>
);

export const UsersIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M16 18.5c0-2.2-2.3-4-5-4s-5 1.8-5 4" /><circle cx="11" cy="7.5" r="3" /><path d="M20 18c0-1.8-1.4-3.3-3.4-3.8" /><path d="M16.5 5.5a2.6 2.6 0 0 1 0 5.2" /></SvgIcon>
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 3 19 6v5.2c0 4-2.6 7.5-7 9.8-4.4-2.3-7-5.8-7-9.8V6l7-3Z" /><path d="M9.5 12.2 11.2 14l3.5-4" /></SvgIcon>
);

export const CreditCardIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 9h18" /><path d="M7 14h3" /></SvgIcon>
);

export const ChartIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15.5V11" /><path d="M12 15.5V8.5" /><path d="M16 15.5V6.5" /></SvgIcon>
);

export const TagIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="m20 13-7 7-9-9V4h7l9 9Z" /><circle cx="7.5" cy="7.5" r="1.2" /></SvgIcon>
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><circle cx="12" cy="8" r="3.25" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></SvgIcon>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><circle cx="11" cy="11" r="5.5" /><path d="m20 20-3.5-3.5" /></SvgIcon>
);

export const BellIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M15.5 17H8.5" /><path d="M18 17H6c1.3-1.4 2-2.9 2-5.3V10a4 4 0 1 1 8 0v1.7c0 2.4.7 3.9 2 5.3Z" /><path d="M10.3 18.8a1.8 1.8 0 0 0 3.4 0" /></SvgIcon>
);

export const MessageIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M20 14.5a3.5 3.5 0 0 1-3.5 3.5H9l-5 3V7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v7Z" /><path d="M8 9.5h8" /><path d="M8 12.5h5.5" /></SvgIcon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="m6.5 9 5.5 5.5L17.5 9" /></SvgIcon>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></SvgIcon>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 5v14" /><path d="M5 12h14" /></SvgIcon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 3v10" /><path d="m8 10 4 4 4-4" /><path d="M5 20h14" /></SvgIcon>
);

export const FilterIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></SvgIcon>
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="m4 20 4.5-1 10.8-10.8a1.8 1.8 0 0 0 0-2.5l-.5-.5a1.8 1.8 0 0 0-2.5 0L5.4 15.1 4 20Z" /><path d="M13.2 6.8 17.2 10.8" /></SvgIcon>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12 17.9 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></SvgIcon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M5 7h14" /><path d="M10 3.8h4" /><path d="M8 7l.6 13h6.8L16 7" /><path d="M10.5 11v5" /><path d="M13.5 11v5" /></SvgIcon>
);

export const UploadIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 16V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M5 20h14" /></SvgIcon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="m12 3 1.1 3.6L17 7.7l-3.2 2.1L12 13l-1.8-3.2L7 7.7l3.9-.1L12 3Z" /><path d="m5 13 0.7 2.2L8 16l-2.3.8L5 19l-.7-2.2L2 16l2.3-.8L5 13Z" /><path d="m18 13 0.7 2.2L21 16l-2.3.8L18 19l-.7-2.2L15 16l2.3-.8L18 13Z" /></SvgIcon>
);

export const CalendarIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3.8v3" /><path d="M16 3.8v3" /><path d="M4 9h16" /></SvgIcon>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.5l3 2" /></SvgIcon>
);

export const QrCodeIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><rect x="4" y="4" width="5" height="5" rx="1" /><rect x="15" y="4" width="5" height="5" rx="1" /><rect x="4" y="15" width="5" height="5" rx="1" /><path d="M13 6h2" /><path d="M13 10h5" /><path d="M13 14h2" /><path d="M11 12h2" /><path d="M15 12h5" /><path d="M11 16h3" /><path d="M16 16h4" /></SvgIcon>
);

export const TrendUpIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="m4 15 5-5 4 4 7-7" /><path d="M16 7h4v4" /></SvgIcon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><circle cx="12" cy="12" r="8.5" /><path d="M8.7 12.2 11 14.5l4.5-5" /></SvgIcon>
);

export const AlertIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 4 3.7 18.2A1.8 1.8 0 0 0 5.2 21h13.6a1.8 1.8 0 0 0 1.6-2.8L12 4Z" /><path d="M12 9v4" /><path d="M12 16.8h.01" /></SvgIcon>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" /><path d="M14 9l4 3-4 3" /><path d="M18 12H9.5" /></SvgIcon>
);

export const XIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></SvgIcon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></SvgIcon>
);

export const FileTextIcon: React.FC<IconProps> = (props) => (
  <SvgIcon {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h8" /><path d="M8 17h8" /><path d="M8 9h2" /></SvgIcon>
);
