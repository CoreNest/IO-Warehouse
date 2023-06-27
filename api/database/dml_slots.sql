SET search_path TO warehouse;

TRUNCATE TABLE Items, Slots, Racks, Sectors;

ALTER SEQUENCE items_id_seq RESTART WITH 1;
ALTER SEQUENCE racks_id_seq RESTART WITH 1;
ALTER SEQUENCE sectors_id_seq RESTART WITH 1;

INSERT INTO Sectors (Name) VALUES 
    ('X1'),
    ('X2');

INSERT INTO Racks (Capacity, SectorID) VALUES
    (5, 1),
    (7, 2);

INSERT INTO Items (Name, Description) VALUES
    ('Rubber duck', 'Helps with debugging.'),
    ('Pink cheese', 'Don''t eat it.');

INSERT INTO Slots (RackID, Position, Reserved, ArrivalDate, ExpiryDate, ItemID) VALUES
    (1, 2, FALSE, NULL, NULL, 1),
    (1, 3, TRUE, '2024-01-01', '2024-01-28', 2),
    (2, 0, FALSE, NULL, '2023-11-19', 2);
