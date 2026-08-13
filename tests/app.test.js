const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

afterAll(async () => {
    // Disconnect mongoose to prevent Jest from hanging
    await mongoose.disconnect();
});

describe('GET /', () => {
    it('should return the index.html page with 200 status', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/html/);
    });

    it('should contain Expense Tracker content', async () => {
        const res = await request(app).get('/');
        expect(res.text).toContain('Expense');
    });
});

describe('API routes without DB connection', () => {
    it('POST /add should return 500 when no DB is connected', async () => {
        const res = await request(app)
            .post('/add')
            .send({
                category_select: 'Food',
                amount_input: 100,
                info: 'test',
                date_input: '2026-01-01'
            });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Error inserting data');
    });

    it('PUT /update/:id should return 500 for invalid ID without DB', async () => {
        const res = await request(app)
            .put('/update/000000000000000000000000')
            .send({ category_select: 'Food', amount_input: 50 });
        expect(res.statusCode).toBe(500);
    });

    it('DELETE /delete/:id should return 500 for invalid ID without DB', async () => {
        const res = await request(app)
            .delete('/delete/000000000000000000000000');
        expect(res.statusCode).toBe(500);
    });
});
