const express = require('express');
const { Pool } = require('pg');
const app = express();
const cors = require('cors')
const authenticate = require('./middleware/authenticate.js')

// app.use(authenticate)
app.use(cors())
app.use(express.json())
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'testing',
    password: 'root',
    port: 5432,
});

app.get('/', (req, res) => {
    return res.json({
        name: "holla"
    })
})

app.get('/api/cagar', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT gid, nm_objekcb, nm_kategor, deskripsi, district, provinsi, status, shape_leng, shape_area FROM cagar_aceh"
        );
        const geojson = {
            type: "FeatureCollection",
            features: result.rows.map(row => ({
                type: "Feature",
                properties: {
                    gid: row.gid,
                    name: row.nm_objekcb,
                    kategori: row.nm_kategor,
                    deskripsi: row.deskripsi,
                    district: row.district,
                    provinsi: row.provinsi,
                    status: row.status,
                    shape_leng : row.shape_leng, 
                    shape_area : row.shape_area
                },
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/cagar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT gid, nm_objekcb, nm_kategor, deskripsi, district, provinsi, status, shape_leng, shape_area FROM cagar_aceh WHERE gid = ${id}`,
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Data not found');
        }

        const feature = {
            type: "Feature",
            properties: {
                gid: result.rows[0].gid,
                name: result.rows[0].nm_objekcb,
                kategori: result.rows[0].nm_kategor,
                deskripsi: result.rows[0].deskripsi,
                district: result.rows[0].district,
                provinsi: result.rows[0].provinsi,
                status: result.rows[0].status,
                shape_area: result.rows[0].shape_area,
                shape_leng: result.rows[0].shape_leng,
            },
        };

        res.json(feature);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});


app.post('/api/cagar', async (req, res) => {
    const {
        nm_objekcb,
        nm_kategor,
        slug_kateg,
        deskripsi,
        district,
        province,
        objectid,
        provinsi,
        longitude,
        latitude
    } = req.body;
    console.log(req.body)

    try {
        const result = await pool.query(
            `INSERT INTO cagar_aceh (
                nm_objekcb, 
                nm_kategor, 
                slug_kateg, 
                deskripsi, 
                district, 
                province, 
                objectid, 
                provinsi,
                geom,
                status
            ) 
            VALUES ('${nm_objekcb}', '${nm_kategor}', '${slug_kateg}', '${deskripsi}', '${district}', '${province}', ${objectid}, '${provinsi}',
                    ST_GeomFromText('POINT(${longitude} ${latitude})', 4326), 0) `,
        );
        console.log("result", result)
        res.status(201).json({
            message: 'Data successfully inserted',
            data: req.body
        });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Failed to insert data' });
    }
});

app.delete('/api/cagar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`DELETE FROM cagar_aceh WHERE gid = ${id}`);
        if (result.rowCount > 0) {
            res.status(200).send('Item deleted successfully');
        } else {
            res.status(404).send('Item not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting item');
    }
});

app.put('/api/cagar/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nm_objekcb,
        nm_kategor,
        slug_kateg,
        deskripsi,
        district,
        province,
    } = req.body;

    try {
        console.log('ID:', id);
        const result = await pool.query(
            `UPDATE cagar_aceh
             SET 
            nm_objekcb = '${nm_objekcb}',
            nm_kategor = '${nm_kategor}',
            slug_kateg = '${slug_kateg}',
            deskripsi = '${deskripsi}',
            district = '${district}',
            province = '${province}'
            WHERE gid = ${id}`
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Data not found or no changes made' });
        }

        // Respon sukses
        res.status(200).json({
            message: 'Data successfully updated',
            data: result.rows[0],
        });
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Failed to update data' });
    }
});
app.put('/api/cagar/status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        console.log('ID:', id, 'Status:', status);
        const result = await pool.query(
            `UPDATE cagar_aceh
             SET 
            status = ${status}
            WHERE gid = ${id}`
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Data not found or no changes made' });
        }

        // Respon sukses
        res.status(200).json({
            message: 'Data successfully updated',
            data: result.rows[0],
        });
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Failed to update data' });
    }
});





app.listen(3000, () => {
    console.log('Server running on port 3000');
});
