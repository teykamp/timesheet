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
  status: 'working' | 'submitted' | 'approved' | 'revised',
  timesheetNotesCount: number,
}

export type ManagerTimesheet = Timesheet & { email: string }

export type TimesheetStateTypes = 'allTimesheets' | 'singleTimesheet'

export type Project = {
  projectid: number,
  projectname: string
}


export type ProjectAlias = Project & { isAlias: true } // todo: fix -> look at timesheetcellgrid.vue

export type TimesheetEntry = {
  id: number,
  hours: number,
  timesheetId: number,
  date: string
}

export type TimesheetDisplayStatus = 'view' | 'edit' | 'new' | 'review'

export type HeaderItem = {
  title: string,
  key: string,
  align?: 'start' | 'center' | 'end',
  sortable?: boolean,
}

export type TimesheetNote = {
  timesheetid: number
  incorrecthours: boolean,
  incorrectproject: boolean,
  incorrecttime: boolean,
  commentbody: string,
  requireresubmit: boolean
}


export type Row = {
  projectid: number | null
}

export type Entry = {
  entry: {
    projectid: number | null,
    hoursWorked: number,
    date: Date | null
  }
}

export type TimeTable = (Row | Entry)[][]