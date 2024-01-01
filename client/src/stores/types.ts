type Timesheet = {
    timesheetid: number,
    enddate: string,
    totalHours: number,
    status: 'working' | 'submitted' | 'approved' | 'revise'
  }

export type { Timesheet}