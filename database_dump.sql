DROP TABLE IF EXISTS EmployeeGoal CASCADE;
DROP TABLE IF EXISTS TeamGoal CASCADE;
DROP TABLE IF EXISTS DepartmentGoal CASCADE;
DROP TABLE IF EXISTS CompanyGoal CASCADE;
DROP TABLE IF EXISTS Goal CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS Team CASCADE;
DROP TABLE IF EXISTS Department CASCADE;
DROP TABLE IF EXISTS Company CASCADE;

CREATE TABLE Company (
    companyID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mainAddress VARCHAR(500)
);

CREATE TABLE Department (
    depID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    companyID INT NOT NULL,
    FOREIGN KEY (companyID) REFERENCES Company(companyID) ON DELETE CASCADE
);

CREATE TABLE Team (
    teamID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    depID INT NOT NULL,
    FOREIGN KEY (depID) REFERENCES Department(depID) ON DELETE CASCADE
);

CREATE TABLE Employee (
    employeeID SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    teamID INT,
    FOREIGN KEY (teamID) REFERENCES Team(teamID) ON DELETE SET NULL
);

CREATE TABLE Goal (
    goalID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unitOfMeasure VARCHAR(50),
    status VARCHAR(50),
    targetValue NUMERIC(15, 2),
    currentValue NUMERIC(15, 2),
    startDate DATE,
    endDate DATE
);

CREATE TABLE CompanyGoal (
    goalID INT PRIMARY KEY,
    strategy TEXT,
    companyID INT NOT NULL,
    FOREIGN KEY (goalID) REFERENCES Goal(goalID) ON DELETE CASCADE,
    FOREIGN KEY (companyID) REFERENCES Company(companyID) ON DELETE CASCADE
);

CREATE TABLE DepartmentGoal (
    goalID INT PRIMARY KEY,
    budget NUMERIC(15, 2),
    depID INT NOT NULL,
    FOREIGN KEY (goalID) REFERENCES Goal(goalID) ON DELETE CASCADE,
    FOREIGN KEY (depID) REFERENCES Department(depID) ON DELETE CASCADE
);

CREATE TABLE TeamGoal (
    goalID INT PRIMARY KEY,
    teamID INT NOT NULL,
    FOREIGN KEY (goalID) REFERENCES Goal(goalID) ON DELETE CASCADE,
    FOREIGN KEY (teamID) REFERENCES Team(teamID) ON DELETE CASCADE
);

CREATE TABLE EmployeeGoal (
    goalID INT PRIMARY KEY,
    smartGoal TEXT,
    employeeID INT NOT NULL,
    FOREIGN KEY (goalID) REFERENCES Goal(goalID) ON DELETE CASCADE,
    FOREIGN KEY (employeeID) REFERENCES Employee(employeeID) ON DELETE CASCADE
);

SET session_replication_role = replica;

\copy Company(companyID, name, mainAddress) FROM './data/company.csv' CSV HEADER;
\copy Department(depID, name, location, companyID) FROM './data/department.csv' CSV HEADER;
\copy Team(teamID, name, depID) FROM './data/team.csv' CSV HEADER;
\copy Employee(employeeID, firstName, lastName, email, teamID) FROM './data/employee.csv' CSV HEADER;
\copy Goal(goalID, name, unitOfMeasure, status, targetValue, currentValue, startDate, endDate) FROM './data/goal.csv' CSV HEADER;
\copy EmployeeGoal(goalID, smartGoal, employeeID) FROM './data/employeegoal.csv' CSV HEADER;
\copy TeamGoal(goalID, teamID) FROM './data/teamgoal.csv' CSV HEADER;
\copy DepartmentGoal(goalID, budget, depID) FROM './data/departmentgoal.csv' CSV HEADER;
\copy CompanyGoal(goalID, strategy, companyID) FROM './data/companygoal.csv' CSV HEADER;

SET session_replication_role = DEFAULT;
