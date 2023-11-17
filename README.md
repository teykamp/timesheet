# Timesheet
Timesheet tracking for employees and managers


## Object Model:

```text
User
|-- userId (Google's unique identifier, often 'sub' from the OAuth response)
|-- username (optional, might not be provided by Google)
|-- email (user's email address from Google OAuth)
|-- timesheets []

Timesheet
|-- timesheetId
|-- userId (FK)
|-- startDate
|-- endDate
|-- managerId (FK)
|-- entries []

TimesheetEntry
|-- entryId
|-- timesheetId (FK)
|-- projectId
|-- hoursWorked
|-- date

Project
|-- projectId
|-- projectName

Manager
|-- managerId
|-- name
|-- email
|-- timesheets []
```

## Description:

### User:
- **Properties:** 
    - userId (use the unique identifier from Google OAuth, often called sub)
    - username (optional, as it may not be provided by Google)
    - email (the user's email address from Google OAuth)
    - timesheets (list of user's timesheets)

- **Relationships:**
    - One user can have multiple timesheets.

### Timesheet:
- **Properties:** 
    - timesheetId
    - userId (foreign key)
    - startDate
    - endDate
    - etc.

- **Relationships:**
    - One timesheet belongs to one user.
    - One timesheet has multiple entries (representing hours worked on different projects on different days).
    - One timesheet is associated with one manager (managerId).

### TimesheetEntry:
- **Properties:**
    - entryId
    - timesheetId (foreign key)
    - projectId
    - hoursWorked
    - date
    - etc.

- **Relationships:**
    - One entry belongs to one timesheet.
    - One entry is associated with one project.
    - This might be compressed into timesheet, as it is probably not needed.

### Project:
- **Properties:**
    - projectId
    - projectName

- **Relationships:**
    - One project can be associated with multiple entries in different timesheets.

### Manager:
- **Properties:**
    - managerId
    - name
    - email
    - etc.

- **Relationships:**
    - One manager can be associated with multiple timesheets (as the recipient of timesheets).

