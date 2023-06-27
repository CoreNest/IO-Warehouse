SET search_path TO warehouse;

TRUNCATE TABLE Items, Slots, Racks, Sectors;

ALTER SEQUENCE racks_id_seq RESTART WITH 1;
ALTER SEQUENCE sectors_id_seq RESTART WITH 1;

INSERT INTO Sectors (Name) VALUES 
    ('X1'),
    ('X2');

INSERT INTO Racks (Capacity, SectorID) VALUES
    (5, 1),
    (7, 1);
