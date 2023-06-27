DROP SCHEMA IF EXISTS warehouse CASCADE;

CREATE SCHEMA warehouse;

CREATE SEQUENCE warehouse.items_id_seq;

CREATE TABLE warehouse.Items (
                ID INTEGER NOT NULL DEFAULT nextval('warehouse.items_id_seq'),
                Name VARCHAR(255),
                Description VARCHAR(255),
                CONSTRAINT items_pk PRIMARY KEY (ID)
);


ALTER SEQUENCE warehouse.items_id_seq OWNED BY warehouse.Items.ID;

CREATE SEQUENCE warehouse.sectors_id_seq;

CREATE TABLE warehouse.Sectors (
                ID INTEGER NOT NULL DEFAULT nextval('warehouse.sectors_id_seq'),
                Name VARCHAR(255),
                CONSTRAINT sectors_pk PRIMARY KEY (ID)
);


ALTER SEQUENCE warehouse.sectors_id_seq OWNED BY warehouse.Sectors.ID;

CREATE SEQUENCE warehouse.racks_id_seq;

CREATE TABLE warehouse.Racks (
                ID INTEGER NOT NULL DEFAULT nextval('warehouse.racks_id_seq'),
                Capacity INTEGER NOT NULL,
                SectorID INTEGER NOT NULL,
                CONSTRAINT racks_pk PRIMARY KEY (ID)
);


ALTER SEQUENCE warehouse.racks_id_seq OWNED BY warehouse.Racks.ID;

CREATE TABLE warehouse.Slots (
                Position INTEGER NOT NULL,
                RackID INTEGER NOT NULL,
                Reserved BOOLEAN NOT NULL,
                ArrivalDate DATE,
                ExpiryDate DATE,
                ItemID INTEGER NOT NULL,
                CONSTRAINT slots_pk PRIMARY KEY (Position, RackID)
);


CREATE SEQUENCE warehouse.users_id_seq;

CREATE TABLE warehouse.Users (
                ID INTEGER NOT NULL DEFAULT nextval('warehouse.users_id_seq'),
                Name VARCHAR(255) NOT NULL,
                CONSTRAINT users_pk PRIMARY KEY (ID)
);


ALTER SEQUENCE warehouse.users_id_seq OWNED BY warehouse.Users.ID;

ALTER TABLE warehouse.Slots ADD CONSTRAINT item_slots_fk
FOREIGN KEY (ItemID)
REFERENCES warehouse.Items (ID)
ON DELETE RESTRICT
ON UPDATE RESTRICT
NOT DEFERRABLE;

ALTER TABLE warehouse.Racks ADD CONSTRAINT sectors_racks_fk
FOREIGN KEY (SectorID)
REFERENCES warehouse.Sectors (ID)
ON DELETE RESTRICT
ON UPDATE RESTRICT
NOT DEFERRABLE;

ALTER TABLE warehouse.Slots ADD CONSTRAINT racks_slots_fk
FOREIGN KEY (RackID)
REFERENCES warehouse.Racks (ID)
ON DELETE RESTRICT
ON UPDATE RESTRICT
NOT DEFERRABLE;
