-- Insert sample data into Stages table
INSERT INTO Stages (id, name, remarks) VALUES
(NEWID(), 'HOLD from Team', ''),
(NEWID(), 'Under Manufacturing', ''),
(NEWID(), 'Ready for Internal FAT', ''),
(NEWID(), 'Ready for Client FAT', ''),
(NEWID(), 'Ready for Dispatch', ''),
(NEWID(), 'Dispatched', '');

-- Insert sample data into Projects table
INSERT INTO Projects (id, projectNo, customerName, owner, projectDate, targetDate, productionStage, remarks) VALUES
(NEWID(), 'P001', 'Acme Corporation', 'John Doe', '2024-01-15', '2024-03-15', 'Production', 'On track for delivery.'),
(NEWID(), 'P002', 'Globex Corporation', 'Jane Smith', '2024-02-01', '2024-04-01', 'Design', 'Awaiting customer feedback on prototype.');