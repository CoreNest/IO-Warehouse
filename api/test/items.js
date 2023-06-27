import apiRouter from '../src/api.js';
import assert from 'assert';
import express from 'express';
import request from 'supertest';
import { before, beforeEach, describe, it } from 'node:test';
import executeFromFile from '../database/populate.js';

describe('items', async () => {
    let app;
    before(async () => {
        app = express();
        app.use(apiRouter);
    });
    beforeEach(async () => {
        await executeFromFile('dml_items');
    });

    it('get all successfully', async () => {
        let items = (await request(app)
            .get('/items')
            .send()
            .expect(200)).body;
        assert.equal(items.length, 2);
        assert.deepStrictEqual(items.find(r => r.id == 1), {
            'id': 1,
            'name': 'Rubber duck',
            'description': 'Helps with debugging.',
        });
        assert.deepStrictEqual(items.find(r => r.id == 2), {
            'id': 2,
            'name': 'Pink cheese',
            'description': 'Don\'t eat it.',
        });
    });
    it('get by id successfully', async () => {
        let item1 = (await request(app)
            .get('/items/1')
            .send()
            .expect(200)).body;
        assert.deepStrictEqual(item1, {
            'id': 1,
            'name': 'Rubber duck',
            'description': 'Helps with debugging.',
        });

        let item2 = (await request(app)
            .get('/items/2')
            .send()
            .expect(200)).body;
        assert.deepStrictEqual(item2, {
            'id': 2,
            'name': 'Pink cheese',
            'description': 'Don\'t eat it.',
        });
    });
    it('post successfully', async () => {
        await request(app)
            .post('/items')
            .send({ 'name': 'Bottled air', 'description': 'A mixture of gases.' })
            .expect(200);
        await request(app)
            .post('/items')
            .send({ 'name': '1zl coin', 'description': 'Exclusive item.' })
            .expect(200);

        let items = (await request(app)
            .get('/items')
            .send()
            .expect(200)).body;
        assert.equal(items.length, 4);
        assert.deepStrictEqual(items.find(r => r.id == 3), {
            'id': 3,
            'name': 'Bottled air',
            'description': 'A mixture of gases.',
        });
        assert.deepStrictEqual(items.find(r => r.id == 4), {
            'id': 4,
            'name': '1zl coin',
            'description': 'Exclusive item.',
        });
    });
    it('delete successfully', async () => {
        await request(app)
            .delete('/items/1')
            .send()
            .expect(200);
        let items = (await request(app)
            .get('/items')
            .send()
            .expect(200)).body;
        assert.equal(items.length, 1);
        assert.equal(items[0].name, 'Pink cheese');

        await request(app)
            .delete('/items/2')
            .send()
            .expect(200);
        items = (await request(app)
            .get('/items')
            .send()
            .expect(200)).body;
        assert.equal(items.length, 0);
    });
});
