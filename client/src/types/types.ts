export type GoogleProfile = {
  id: string,
  email: string,
  verified_email: boolean,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}

export type Timesheet = {
  timesheetid: number,
  enddate: string,
  totalHours: number,
  status: 'working' | 'submitted' | 'approved' | 'revise'
}

export type TimesheetStateTypes = 'allTimesheets' | 'singleTimesheet'

export type Project = {
  projectid: number,
  projectname: string
}

export type TimesheetEntry = {
  id: number,
  hours: number,
  timesheetId: number,
  date: string
}

export type TimesheetDisplayStatus = 'view' | 'edit' | 'new'

export type HeaderItem = {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
}