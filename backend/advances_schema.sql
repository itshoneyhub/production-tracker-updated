CREATE TABLE Debtors (
    id UUID PRIMARY KEY,
    project_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    advance_date DATE NOT NULL,
    advance_amount DECIMAL(10, 2)
);

CREATE TABLE Creditors (
    id UUID PRIMARY KEY,
    project_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    advance_date DATE NOT NULL,
    advance_amount DECIMAL(10, 2)
);