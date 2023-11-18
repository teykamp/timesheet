# Timesheet
Timesheet tracking for employees and managers


## Object Model:

```text
User

|-- userId (Google's unique identifier, often 'sub' from the OAuth response)
|-- username (optional, might not be provided by Google)
|-- email (user's email address from Google OAuth)
|-- managerId (FK)
|-- isManager

Timesheet
|-- timesheetId
|-- userId (FK)
|-- endDate

TimesheetEntry
|-- entryId
|-- timesheetId (FK)
|-- projectId (FK)
|-- hoursWorked
|-- date

Project
|-- projectId
|-- projectName
 
Aliases
|-- userId (FK)
|-- projectId (FK)
|-- alias
```

## Description:

### User:
- **Properties:** 
    - userId (use the unique identifier from Google OAuth, often called sub)
    - username (optional, as it may not be provided by Google)
    - email (the user's email address from Google OAuth)
    - managerId
    - isManager (boolean)

- **Relationships:**
    - One user can have multiple timesheets.
    - One manager can have multiple employees.

### Timesheet:
- **Properties:** 
    - timesheetId
    - userId (foreign key)
    - endDate

- **Relationships:**
    - One timesheet belongs to one user.
    - One timesheet has multiple entries (representing hours worked on different projects on different days).

### TimesheetEntry:

- **Properties:**
    - entryId
    - timesheetId (foreign key)
    - projectId
    - hoursWorked
    - date

- **Relationships:**
    - One entry belongs to one timesheet.
    - One entry is associated with one project and one date.  

### Project:
- **Properties:**
    - projectId
    - projectName

- **Relationships:**
    - One project can be associated with multiple entries in different timesheets.  
    
### Alias
- **Properties**
    - userId (foreign key)
    - projectId (foreign key)
    - alias (string) 
- **Relationships**
    - one alias is associated with one project for one user
