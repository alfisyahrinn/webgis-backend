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
    database: 'webgis',
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
            "SELECT gid, nm_objekcb, nm_kategor, deskripsi, district, provinsi, status, ST_AsGeoJSON(geom)::json AS geometry FROM cagar_aceh"
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
                },
                geometry: row.geometry
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
            `SELECT gid, nm_objekcb, nm_kategor, deskripsi, district, provinsi, status, ST_AsGeoJSON(geom)::json AS geometry FROM cagar_aceh WHERE gid = ${id}`,
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
            },
            geometry: result.rows[0].geometry,
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




app.listen(3000, () => {
    console.log('Server running on port 3000');
});
