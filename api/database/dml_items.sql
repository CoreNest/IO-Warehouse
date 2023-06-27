SET search_path TO warehouse;

TRUNCATE TABLE Items, Slots;

ALTER SEQUENCE items_id_seq RESTART WITH 1;

INSERT INTO Items (Name, Description) VALUES
    ('Rubber duck', 'Helps with debugging.'),
    ('Pink cheese', 'Don''t eat it.');
