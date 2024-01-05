# Timesheet
Timesheet tracking for employees and managers


## Object Model:

```text
TimesheetUser 
|-- userId (Google's unique identifier, often 'sub' from the OAuth response)
|-- username (optional, might not be provided by Google)
|-- email (user's email address from Google OAuth)
|-- managerId (FK)
|-- isManager

Timesheet
|-- timesheetId
|-- userId (FK)
|-- endDate
|-- status

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

Notification
|-- notificationId
|-- timesheetId (FK)
|-- title
|-- content
|-- date
|-- fromUserId
|-- notificationType
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
    - status

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
    
### Alias:
- **Properties**
    - userId (foreign key)
    - projectId (foreign key)
    - alias (string) 
- **Relationships**
    - one alias is associated with one project for one user
 

### Notification:
- **Properties**
   - timesheetId (foreign key)
   - fromId (foreignKey)
   - title
   - content
   - date
   - notificationType
- **Relationships**
   - a notificatin is shared between two users (manager (fromUserId) and employee (found in timesheet))
   - a notification can have a type or none

 ## Database Setup Queries
- Setting up projects table
```SQL
CREATE TABLE Project (
    projectId SERIAL PRIMARY KEY,
    projectName VARCHAR(255) NOT NULL
);
```
- Setting up timesheetEntries table
```SQL
CREATE TABLE TimesheetEntry (
    entryId SERIAL PRIMARY KEY,
    timesheetId INT,
    projectId INT,
    hoursWorked INT,
    date DATE,
    FOREIGN KEY (timesheetId) REFERENCES Timesheet(timesheetId),
    FOREIGN KEY (projectId) REFERENCES Project(projectId)
);
```
- Setting up the timesheets table
```SQL
CREATE TABLE Timesheet (
    timesheetId SERIAL PRIMARY KEY,
    userId VARCHAR(255),
    endDate DATE,
    status VARCHAR(10) CHECK (status IN ('approved', 'working', 'submitted', 'revise')),
    FOREIGN KEY (userId) REFERENCES TimesheetUser(userId)
);
```
- Setting up the users table
```SQL
CREATE TABLE TimesheetUser (
    userId VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    managerId VARCHAR(255),
    isManager BOOLEAN,
    FOREIGN KEY (managerId) REFERENCES TimesheetUser(userId)
);
```
- Setting up the notifications table
```SQL
CREATE TABLE TimesheetNotification (
    notificationId SERIAL PRIMARY KEY,
    timesheetId INTEGER REFERENCES Timesheet(timesheetId),
    title VARCHAR(255),
    content VARCHAR(255),
    date DATE,
    fromUserId VARCHAR(255) REFERENCES TimesheetUser(userId),
    notificationType VARCHAR(10) CHECK (notificationType IN ('timesheet', 'expense', ''))
);
```
