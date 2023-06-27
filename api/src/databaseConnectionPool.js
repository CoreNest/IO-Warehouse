import Ajv from 'ajv';
import assert from 'assert';
import pg from 'pg';

const ajv = new Ajv();

class DatabaseConnectionPool {
    #client;

    constructor() {
        // gets connection info from environment variables
        // (https://www.postgresql.org/docs/current/libpq-envars.html)
        // TODO: use a config file instead
        this.#client = new pg.Pool({ max: 2 });

        this.#client.on('connect', async (client) => {
            await client.query('SET search_path TO warehouse;')
        })
    }

    static #validateRack = ajv.compile({
        type: 'object',
        properties: {
            id: { type: 'integer' },
            capacity: { type: 'integer' },
            occupied: { type: 'integer' },
            sectorId: { type: 'integer' },
        },
        required: ['capacity', 'sectorId'],
        additionalProperties: false,
    });

    async getRacks() {
        const racks = (await this.#client.query(`
            SELECT
                ID AS "id",
                Capacity AS "capacity",
                COUNT(Position)::int AS "occupied",
                SectorID AS "sectorId"
            FROM Racks
            LEFT JOIN Slots ON Slots.RackID = Racks.ID
            GROUP BY ID, Capacity, SectorID
        `)).rows;
        assert(racks.every(r => DatabaseConnectionPool.#validateRack(r)));

        return racks;
    }

    async getRackById(id) {
        const result = await this.#client.query(`
            SELECT
                Capacity AS "capacity",
                SectorID AS "sectorId"
            FROM Racks
            WHERE ID = $1
        `, [id]);
        if (result.rowCount == 0) {
            return null;
        }

        const rack = result.rows[0];
        assert(DatabaseConnectionPool.#validateRack(rack));
        rack.slots = (await this.#client.query(`
            SELECT *
            FROM Slots
            WHERE RackID = $1
        `, [id])).rows;
        return rack;
    }

    async addRack(rack) {
        if (!DatabaseConnectionPool.#validateRack(rack)) {
            return false;
        }

        return await this.#client.query(
            'INSERT INTO Racks (Capacity, SectorID) VALUES ($1, $2);',
            [rack.capacity, rack.sectorId]
        ).then(() => true, () => false);
    }

    async removeRack(id) {
        const result = await this.#client.query('DELETE FROM Racks WHERE ID = $1', [id]);
        return result.rowCount != 0;
    }

    async getSectors() {
        const sectors = (await this.#client.query('SELECT ID AS "ID", Name FROM Sectors')).rows;
        return Promise.all(sectors.map(async (sector) => {
            const rackIDs = (await this.#client.query('SELECT ID AS "ID" FROM Racks WHERE sectorID = $1', [sector.ID]));
            sector.racks = rackIDs.rows.map((rack) => rack.ID)
            return sector;
        }, this))
    }

    static #validateSector = ajv.compile({
        type: 'object',
        properties: {
            name: { type: 'string' }
        },
        additionalProperties: false,
    })

    async addSector(sector) {
        if (!DatabaseConnectionPool.#validateSector(sector)) {
            return null;
        }

        return (await this.#client.query('INSERT INTO Sectors (Name) VALUES ($1) RETURNING ID AS "ID"', [sector.name])).rows[0];
    }

    async removeSector(id) {
        const result = await this.#client.query(`
            DELETE
            FROM Sectors
            WHERE
                ID = $1
                AND (SELECT COUNT(*) FROM Racks WHERE SectorID = $1) = 0;
        `, [id]);
        return result.rowCount != 0;
    }

    async getSectorById(id) {
        const doesSectorExist = (await this.#client.query('SELECT ID FROM Sectors WHERE ID = $1', [id])).rowCount == 1
        if (!doesSectorExist) {
            return null;
        }

        const sector = (await this.#client.query('SELECT ID As "rackID", Capacity FROM Racks WHERE sectorID = $1', [id])).rows;
        return Promise.all(sector.map(async (rack) => {
            rack.slots = (await this.#client.query('SELECT * FROM Slots')).rows;
            return rack;
        }), this);
    }

    static #validateSlot = ajv.compile({
        type: 'object',
        properties: {
            rackId: { type: 'integer' },
            position: { type: 'integer' },
            reserved: { type: 'boolean' },
            arrivalDate: { type: 'string', nullable: true },
            expiryDate: { type: 'string', nullable: true },
            itemId: { type: 'integer' },
        },
        required: ['reserved', 'arrivalDate', 'expiryDate', 'itemId'],
        additionalProperties: false,
    });

    async getSlotsByRackId(rackId) {
        const result = await this.#client.query(`
            SELECT
                RackID AS "rackId",
                Position AS "position",
                Reserved AS "reserved",
                TO_CHAR(ArrivalDate, 'yyyy-mm-dd') AS "arrivalDate",
                TO_CHAR(ExpiryDate, 'yyyy-mm-dd') AS "expiryDate",
                ItemID AS "itemId"
            FROM SLOTS
            WHERE RackID = $1
        `, [rackId]);
        const slots = result.rows;
        assert(slots.every(s => DatabaseConnectionPool.#validateSlot(s)));
        return slots;
    }

    async getSlotByRackIdAndPosition(rackId, position) {
        const result = await this.#client.query(`
            SELECT
                RackID AS "rackId",
                Position AS "position",
                Reserved AS "reserved",
                TO_CHAR(ArrivalDate, 'yyyy-mm-dd') AS "arrivalDate",
                TO_CHAR(ExpiryDate, 'yyyy-mm-dd') AS "expiryDate",
                ItemID AS "itemId"
            FROM SLOTS
            WHERE RackID = $1 AND Position = $2
        `, [rackId, position]);

        if (result.rowCount == 0) {
            return null;
        }
        assert.equal(result.rowCount, 1);

        const slot = result.rows[0];
        assert(DatabaseConnectionPool.#validateSlot(slot));
        return result.rows[0];
    }

    async getSlotsWithNonNullExpiryDate() {
        const result = await this.#client.query(`
            SELECT
                Sectors.Name AS "sectorName",
                Racks.ID AS "rackId",
                TO_CHAR(Slots.ExpiryDate, 'yyyy-mm-dd') AS "expiryDate",
                Items.Name AS "itemName",
                Items.Description AS "itemDescription"
            FROM Sectors
            INNER JOIN Racks ON Racks.SectorID = Sectors.ID
            INNER JOIN Slots ON Slots.RackID = Racks.ID
            INNER JOIN Items ON Slots.ItemID = Items.ID
            WHERE ExpiryDate IS NOT NULL
        `);
        return result.rows;
    }

    async addSlot(slot) {
        if (!DatabaseConnectionPool.#validateSlot(slot)) {
            return false;
        }

        return await this.#client.query(`
            INSERT INTO Slots
                (RackID, Position, Reserved, ArrivalDate, ExpiryDate, ItemID)
            VALUES
                ($1, $2, $3, $4, $5, $6);
        `, [slot.rackId, slot.position, slot.reserved, slot.arrivalDate, slot.expiryDate, slot.itemId])
            .then(() => true, () => false);
    }

    async removeSlot(rackId, position) {
        const result = await this.#client.query(
            'DELETE FROM Slots WHERE RackID = $1 AND Position = $2',
            [rackId, position],
        );
        return result.rowCount != 0;
    }

    static #validateMoveSlot = ajv.compile({
        type: 'object',
        properties: {
            sourceRackID: { type: 'integer' },
            sourceSlotPosition: { type: 'integer' },
            destinationRackID: { type: 'integer' },
            destinationSlotPosition: { type: 'integer' }
        },
        required: ['sourceRackID', 'sourceSlotPosition', 'destinationRackID', 'destinationSlotPosition'],
        additionalProperties: false,
    });

    async moveSlot(move) {
        if (!DatabaseConnectionPool.#validateMoveSlot(move)) {
            return null;
        }

        const slotQuery = await this.#client.query(
            'SELECT RackID FROM Slots WHERE RackId = $1 AND Position = $2',
            [move.sourceRackID, move.sourceSlotPosition]);
        if (slotQuery.rowCount != 1) {
            return null;
        }

        const result = await this.#client.query(
            'UPDATE Slots SET RackId = $1, Position = $2 WHERE RackId = $3 AND Position = $4',
            [move.destinationRackID, move.destinationSlotPosition, move.sourceRackID, move.sourceSlotPosition]);
        return result.rowCount == 1;
    }

    static #validateItem = ajv.compile({
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
        },
        required: ['name', 'description'],
        additionalProperties: false,
    });

    async getItems() {
        const items = (await this.#client.query(`
            SELECT
                ID AS "id",
                Name AS "name",
                Description AS "description"
            FROM Items;
        `)).rows;
        assert(items.every(r => DatabaseConnectionPool.#validateItem(r)));

        return items;
    }

    async getItemById(id) {
        const result = await this.#client.query(`
            SELECT
                ID AS "id",
                Name AS "name",
                Description AS "description"
            FROM Items
            WHERE ID = $1
        `, [id]);
        if (result.rowCount == 0) {
            return null;
        }

        const item = result.rows[0];
        assert(DatabaseConnectionPool.#validateItem(item));
        return item;
    }

    async addItem(item) {
        if (!DatabaseConnectionPool.#validateItem(item)) {
            return false;
        }

        return await this.#client.query(
            'INSERT INTO Items (Name, Description) VALUES ($1, $2);',
            [item.name, item.description]
        ).then(() => true, () => false);
    }

    async removeItem(id) {
        const result = await this.#client.query('DELETE FROM Items WHERE ID = $1', [id]);
        return result.rowCount != 0;
    }
}

export default DatabaseConnectionPool;
