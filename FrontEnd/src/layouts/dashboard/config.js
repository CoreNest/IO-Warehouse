import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import TruckIcon from '@heroicons/react/24/solid/TruckIcon';
import { SvgIcon } from '@mui/material';
import CalendarIcon from '@heroicons/react/24/solid/CalendarDaysIcon';
import FormIcon from '@heroicons/react/24/solid/DocumentArrowUpIcon';


export const items = [
  {
    title: 'Overview',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Warehouse',
    path: '/warehouse',
    icon: (
      <SvgIcon fontSize="small">
        <TruckIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Calendar',
    path: '/calendar',
    icon: (
      <SvgIcon fontSize="small">
        <CalendarIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Form',
    path: '/form',
    icon: (
      <SvgIcon fontSize="small">
        <FormIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Account',
    path: '/account',
    icon: (
      <SvgIcon fontSize="small">
        <UserIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: (
      <SvgIcon fontSize="small">
        <CogIcon />
      </SvgIcon>
    )
  }
];
