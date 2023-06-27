import apiRouter from '../src/api.js';
import assert from 'assert';
import express from 'express';
import request from 'supertest';
import { before, beforeEach, describe, it } from 'node:test';
import executeFromFile from '../database/populate.js';

describe('racks', async () => {
    let app;
    before(async () => {
        await executeFromFile('dml_racks');
        app = express();
        app.use(apiRouter);
    });
    beforeEach(async () => {
        await executeFromFile('dml_racks');
    });

    it('get all successfully', async () => {
        let racks = (await request(app)
            .get('/racks')
            .send()
            .expect(200)).body;
        assert.equal(racks.length, 2);
        assert.deepEqual(racks.find(r => r.id == 1), {
            'id': 1,
            'capacity': 5,
            'occupied': 0,
            'sectorId': 1,
        });
        assert.deepEqual(racks.find(r => r.id == 2), {
            'id': 2,
            'capacity': 7,
            'occupied': 0,
            'sectorId': 2,
        });
    });
    it('get by id successfully', async () => {
        let rack1 = (await request(app)
            .get('/racks/1')
            .send()
            .expect(200)).body;
        assert.deepStrictEqual(rack1, {
            'capacity': 5,
            'sectorId': 1,
            'slots': [],
        });

        let rack2 = (await request(app)
            .get('/racks/2')
            .send()
            .expect(200)).body;
        assert.deepStrictEqual(rack2, {
            'capacity': 7,
            'sectorId': 2,
            'slots': [],
        });
    });
    it('post successfully', async () => {
        await request(app)
            .post('/racks')
            .send({ 'capacity': 100, 'sectorId': 1 })
            .expect(200);
        await request(app)
            .post('/racks')
            .send({ 'capacity': 200, 'sectorId': 2 })
            .expect(200);
        await request(app)
            .post('/racks')
            .send({ 'capacity': 300, 'sectorId': 1 })
            .expect(200);

        let racks = (await request(app)
            .get('/racks')
            .send()
            .expect(200)).body;
        assert.equal(racks.length, 5);
        assert.deepEqual(racks.find(r => r.id == 3), {
            'id': 3,
            'capacity': 100,
            'occupied': 0,
            'sectorId': 1,
        });
        assert.deepEqual(racks.find(r => r.id == 4), {
            'id': 4,
            'capacity': 200,
            'occupied': 0,
            'sectorId': 2,
        });
        assert.deepEqual(racks.find(r => r.id == 5), {
            'id': 5,
            'capacity': 300,
            'occupied': 0,
            'sectorId': 1,
        });
    });
    it('delete successfully', async () => {
        await request(app)
            .delete('/racks/1')
            .send()
            .expect(200);
        let racks = (await request(app)
            .get('/racks')
            .send()
            .expect(200)).body;
        assert.equal(racks.length, 1);
        assert.equal(racks[0].capacity, 7);

        await request(app)
            .delete('/racks/2')
            .send()
            .expect(200);
        racks = (await request(app)
            .get('/racks')
            .send()
            .expect(200)).body;
        assert.equal(racks.length, 0);
    });
    it('delete non-existant', async () => {
        await request(app)
            .delete('/racks/0')
            .send()
            .expect(400);
        await request(app)
            .delete('/racks/3')
            .send()
            .expect(400);
        const racks = (await request(app)
            .get('/racks')
            .send()
            .expect(200)).body;
        assert.equal(racks.length, 2);
    });
});
