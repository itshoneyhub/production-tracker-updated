CREATE TABLE Projects (
    id UUID PRIMARY KEY,
    projectNo VARCHAR(255) NOT NULL,
    projectName VARCHAR(255),
    customerName VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    projectDate DATE NOT NULL,
    targetDate DATE NOT NULL,
    dispatchMonth VARCHAR(255),
    productionStage VARCHAR(255) NOT NULL,
    remarks TEXT
);

CREATE TABLE Stages (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    remarks TEXT
);