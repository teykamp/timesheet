# Timesheet
Timesheet tracking for employees and managers

### Employee

![image](https://github.com/teykamp/timesheet/assets/46391052/75f8446b-0173-464e-b384-1ef4bf3d5d01)
Employees can view all of their timesheets including hours, status, and date. They have the option to edit or withdraw them as well.

![image](https://github.com/teykamp/timesheet/assets/46391052/0c226bb4-2482-4438-abeb-b71117ff2902)
Creating or editing timesheets is as simple as filling in the grid layout.


### Manager

![image](https://github.com/teykamp/timesheet/assets/46391052/e1072987-15d0-4793-8025-4162ff569877)
Managers can view timesheets of their designated employees as well as approve them, reject them, or request edits.

![image](https://github.com/teykamp/timesheet/assets/46391052/6e98f96a-6944-4f71-bb37-f05fea185d1e)
Requestig edits is simple and fast. Empoyees then get notified and can make the adjusted changes and resubmit. The status of the timesheets changes accordingly as well.

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

TimesheetNote
|-- noteId
|-- timesheetId (FK)
|-- incorrectHours
|-- incorrectProject
|-- incorrectTime
|-- commentBody
|-- requireResubmit
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
   - fromId (foreign key)
   - title
   - content
   - date
   - notificationType
- **Relationships**
   - a notificatin is shared between two users (manager (fromUserId) and employee (found in timesheet))
   - a notification can have a type or none
 
### Timesheet Note:
- **Properties**
  - noteId
  - timesheetId: (foreign key)
  - incorrectHours
  - incorrectProject
  - incorrectTime
  - commentBody
  - requireResubmit
- **Relationships**:
  - A timesheet note is associated with a timesheet (foreign key relationship).

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
- Setting up the timesheet note table
```SQL
CREATE TABLE TimesheetNote (
  noteId SERIAL PRIMARY KEY,
  timesheetId INT REFERENCES Timesheet(timesheetId) ON DELETE CASCADE,
  incorrectHours BOOLEAN NOT NULL,
  incorrectProject BOOLEAN NOT NULL,
  incorrectTime BOOLEAN NOT NULL,
  commentBody TEXT,
  requireResubmit BOOLEAN NOT NULL
);
```
