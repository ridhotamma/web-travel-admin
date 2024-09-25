import { Feed as FeedIcon } from '@mui/icons-material';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactElement;
}

export const sidebarItems: SidebarItem[] = [
  {
    id: 'list-request',
    label: 'Dashboard',
    href: '/',
    icon: <FeedIcon />,
  },
];
