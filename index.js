const express = require('express');
const { Pool } = require('pg');
const app = express();
const cors = require('cors')

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
            "SELECT gid, nm_objekcb, nm_kategor, deskripsi, district, provinsi, ST_AsGeoJSON(geom)::json AS geometry FROM cagar_aceh"
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
                geom
            ) 
            VALUES ('${nm_objekcb}', '${nm_kategor}', '${slug_kateg}', '${deskripsi}', '${district}', '${province}', ${objectid}, '${provinsi}',
                    ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)) `,
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



app.get('/api/buildings', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT gid, name, pendidikan, ST_AsGeoJSON(geom)::json AS geometry FROM building"
        );
        const geojson = {
            type: "FeatureCollection",
            features: result.rows.map(row => ({
                type: "Feature",
                properties: { gid: row.gid, name: row.name, pendidikan: row.pendidikan },
                geometry: row.geometry
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
});
