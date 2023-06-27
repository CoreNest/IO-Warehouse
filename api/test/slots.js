import apiRouter from '../src/api.js';
import assert from 'assert';
import express from 'express';
import request from 'supertest';
import { before, beforeEach, describe, it } from 'node:test';
import executeFromFile from '../database/populate.js';

describe('slots', async () => {
    let app;
    before(async () => {
        app = express();
        app.use(apiRouter);
    });
    beforeEach(async () => {
        await executeFromFile('dml_slots');
    });

    it('get all by rack id successfully', async () => {
        let slots = (await request(app)
            .get('/racks/1/slots')
            .send()
            .expect(200)).body;
        assert.equal(slots.length, 2);
        slots.sort((a, b) => a.position < b.position);
        assert.deepStrictEqual(slots, [
            {
                'rackId': 1,
                'position': 2,
                'reserved': false,
                'arrivalDate': null,
                'expiryDate': null,
                'itemId': 1,
            },
            {
                'rackId': 1,
                'position': 3,
                'reserved': true,
                'arrivalDate': '2024-01-01',
                'expiryDate': '2024-01-28',
                'itemId': 2,
            },
        ]);
        slots = (await request(app)
            .get('/racks/2/slots')
            .send()
            .expect(200)).body;
        assert.equal(slots.length, 1);
        assert.deepStrictEqual(slots, [
            {
                'rackId': 2,
                'position': 0,
                'reserved': false,
                'arrivalDate': null,
                'expiryDate': '2023-11-19',
                'itemId': 2,
            },
        ]);
    });
    it('get by rack id and position successfully', async () => {
        let slot_1_2 = (await request(app)
            .get('/racks/1/slots/2')
            .send()
            .expect(200)).body;
        assert.deepStrictEqual(slot_1_2, {
            'rackId': 1,
            'position': 2,
            'reserved': false,
            'arrivalDate': null,
            'expiryDate': null,
            'itemId': 1,
        });

        let slot_1_3 = (await request(app)
            .get('/racks/1/slots/3')
            .send()
            .expect(200)).body;
        assert.deepStrictEqual(slot_1_3, {
            'rackId': 1,
            'position': 3,
            'reserved': true,
            'arrivalDate': '2024-01-01',
            'expiryDate': '2024-01-28',
            'itemId': 2,
        });

        let slot_2_0 = (await request(app)
            .get('/racks/2/slots/0')
            .send()
            .expect(200)).body;
        assert.deepStrictEqual(slot_2_0, {
            'rackId': 2,
            'position': 0,
            'reserved': false,
            'arrivalDate': null,
            'expiryDate': '2023-11-19',
            'itemId': 2,
        });
    });
    it('post successfully', async () => {
        await request(app)
            .post('/racks/1/slots/0')
            .send({
                'reserved': false,
                'arrivalDate': null,
                'expiryDate': '2023-11-19',
                'itemId': 2,
            })
            .expect(200);

        let slots = (await request(app)
            .get('/racks/1/slots')
            .send()
            .expect(200)).body;
        assert.equal(slots.length, 3);
        assert.deepStrictEqual(slots.find(s => s.position == 0), {
            'rackId': 1,
            'position': 0,
            'reserved': false,
            'arrivalDate': null,
            'expiryDate': '2023-11-19',
            'itemId': 2,
        });
    });
    it('delete successfully', async () => {
        await request(app)
            .delete('/racks/2/slots/0')
            .send()
            .expect(200);
        let slots = (await request(app)
            .get('/racks/2/slots')
            .send()
            .expect(200)).body;
        assert.equal(slots.length, 0);
    });
});
