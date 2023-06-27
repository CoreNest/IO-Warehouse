import DatabaseConnectionPool from './databaseConnectionPool.js';
import express from 'express';

const router = express.Router();
router.use(express.json());

const pool = new DatabaseConnectionPool();

router.get('/racks', async (request, response) => {
    response.send(await pool.getRacks());
});

router.get('/racks/:id', async (request, response) => {
    const rack = await pool.getRackById(request.params.id);
    if (!rack) {
        response.status(404);
        response.send({ 'error': 'Could not find rack matching provided id.' });
        return;
    }

    response.send(rack);
});

router.post('/racks', async (request, response) => {
    if (!await pool.addRack(request.body)) {
        response.status(400);
    }
    response.send();
});

router.delete('/racks/:id', async (request, response) => {
    if (!await pool.removeRack(request.params.id)) {
        response.status(400);
    }
    response.send();
});

router.get('/sectors', async (request, response) => {
    response.send(await pool.getSectors());
});

router.post('/sectors', async (request, response) => {
    const content = await pool.addSector(request.body);
    if (content == null) {
        response.status(400);
    }
    response.send(content);
});

router.delete('/sectors/:id', async (request, response) => {
    if (!await pool.removeSector(request.params.id)) {
        response.status(400);
    }
    response.send();
});

router.get('/sectors/:id', async (request, response) => {
    const sector = await pool.getSectorById(request.params.id);
    if (!sector) {
        response.status(404);
        response.send({ 'error': 'Could not find sector matching provided id.' });
        return;
    }

    response.send(sector);
});

router.get('/racks/:rackId/slots', async (request, response) => {
    response.send(await pool.getSlotsByRackId(request.params.rackId));
});

router.get('/racks/:rackId/slots/:slotPosition', async (request, response) => {
    const slot = await pool.getSlotByRackIdAndPosition(request.params.rackId, request.params.slotPosition);
    if (!slot) {
        response.status(404);
        response.send(
            { 'error': 'Could not find rack matching provided id or slot matching provided position.' }
        );
        return;
    }

    response.send(slot);
});

router.post('/racks/:rackId/slots/:slotPosition', async (request, response) => {
    const slot = request.body;
    slot.rackId = Number(request.params.rackId);
    slot.position = Number(request.params.slotPosition);
    if (!await pool.addSlot(slot)) {
        response.status(400);
    }
    response.send();
});

router.delete('/racks/:rackId/slots/:slotPosition', async (request, response) => {
    if (!await pool.removeSlot(request.params.rackId, request.params.slotPosition)) {
        response.status(400);
    }
    response.send();
});

router.patch('/moveSlot', async (request, response) => {
    const result = await pool.moveSlot(request.body);
    if (result == null) {
        response.status(400);
    }
    response.send();
});

router.get('/items', async (request, response) => {
    response.send(await pool.getItems());
});

router.get('/items/:id', async (request, response) => {
    const item = await pool.getItemById(request.params.id);
    if (!item) {
        response.status(404);
        response.send({ 'error': 'Could not find item matching provided id.' });
        return;
    }

    response.send(item);
});

router.get('/slotsWithNonNullExpiryDate', async (request, response) => {
    response.send(await pool.getSlotsWithNonNullExpiryDate());
});

router.post('/items', async (request, response) => {
    if (!await pool.addItem(request.body)) {
        response.status(400);
    }
    response.send();
});

router.delete('/items/:id', async (request, response) => {
    if (!await pool.removeItem(request.params.id)) {
        response.status(400);
    }
    response.send();
});

// respond to invalid api requests with empty 404 response
router.all('*', (request, response) => {
    response.status(404);
    response.send();
});

export default router;
