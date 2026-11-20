
const pool = require("./db");
const cors = require("cors");
const express = require("express");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/alat.html"));
});

//READ
app.get("/api/alat", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM alat");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

app.get("/api/peminjaman", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM peminjaman");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

app.get("/api/kategori_alat", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM kategori_alat");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

//DELETE
app.delete("/api/alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM alat WHERE id_alat = $1 RETURNING *",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

app.delete("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM peminjaman WHERE id_peminjaman = $1 RETURNING *",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

app.delete("/api/kategori_alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM kategori_alat WHERE id_kategori = $1 RETURNING *",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

//CREATE
app.post("/api/alat", async (req, res) => {
    try {
        const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

        const result = await pool.query(
            `INSERT INTO alat
            (id_kategori, nama_alat, kondisi, stok, lokasi)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [id_kategori, nama_alat, kondisi, stok, lokasi]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal menambahkan alat" });
    }
});

app.post("/api/kategori_alat", async (req, res) => {
    try {
        const { nama_kategori, deskripsi } = req.body;

        const result = await pool.query(
            `INSERT INTO kategori_alat (nama_kategori, deskripsi)
            VALUES ($1, $2) RETURNING *`,
            [nama_kategori, deskripsi]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal menambahkan kategori" });
    }
});

app.post("/api/peminjaman", async (req, res) => {
    try {
        const {
            id_alat,
            nama_peminjam,
            kelas,
            tanggal_pinjam,
            tanggal_kembali,
            jumlah,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO peminjaman
            (id_alat, nama_peminjam, kelas, tanggal_pinjam,
            tanggal_kembali, jumlah, status)
            VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE),
            $5, $6, COALESCE($7, 'Dipinjam'))
            RETURNING *`,
            [
                id_alat,
                nama_peminjam,
                kelas,
                tanggal_pinjam,
                tanggal_kembali,
                jumlah,
                status
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal menambahkan peminjaman" });
    }
});

//UPDATE ALAT
app.patch("/api/alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

        const result = await pool.query(
            `UPDATE alat
            SET id_kategori = COALESCE($1, id_kategori),
                nama_alat = COALESCE($2, nama_alat),
                kondisi = COALESCE($3, kondisi),
                stok = COALESCE($4, stok),
                lokasi = COALESCE($5, lokasi)
            WHERE id_alat = $6
            RETURNING *`,
            [id_kategori, nama_alat, kondisi, stok, lokasi, id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Data tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Data tidak bisa diupdate" });
    }
});

//UPDATE KATEGORI
app.patch("/api/kategori_alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kategori, deskripsi } = req.body;

        const result = await pool.query(
            `UPDATE kategori_alat
            SET nama_kategori = COALESCE($2, nama_kategori),
                deskripsi = COALESCE($3, deskripsi)
            WHERE id_kategori = $1
            RETURNING *`,
            [id, nama_kategori, deskripsi]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Data tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Data tidak bisa diupdate" });
    }
});

//  UPDATE STATUS PEMINJAMAN 
app.patch("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE peminjaman
            SET status = 'Dikembalikan',
                tanggal_kembali = CURRENT_DATE
            WHERE id_peminjaman = $1
            AND status = 'Dipinjam'
            RETURNING *`,
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                message: "Data tidak ditemukan atau sudah dikembalikan"
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Data tidak bisa diupdate" });
    }
});

//MENJALANKAN SERVER 
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});
