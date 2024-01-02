export type HeaderItem = {
    title: string
    key: string
    align?: 'start' | 'center' | 'end'
    sortable?: boolean
}

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
    ...timesheetHeaderData,
    {
        title: 'email',
        key: 'email'
    }
]