import type { HeaderItem } from '../types/types'

export const timesheetHeaderData: HeaderItem[] = [
    {
        title: 'End Date',
        key: 'enddate',
    },
    {
        title: 'Hours',
        key: 'totalHours',
    },
    {
        title: 'Status',
        key: 'status',
    },
    {
        title: '',
        key: 'view',
        align: 'center',
        sortable: false,
    },
    {
        title: 'Actions',
        key: 'actions',
        align: 'end',
        sortable: false,
    },
]

export const managerHeaderData: HeaderItem[] = [
    {
        title: 'Email',
        key: 'email'
    },
    ...timesheetHeaderData,
]