const express = require("express");
const sharp = require("sharp");
const { randomUUID } = require("crypto");

const upload = require("./upload");
const { db, bucket } = require("./firebase");
const { generateSlug } = require("./slug");

const router = express.Router();

router.post("/", upload.single("image"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image not received",
            });
        }

        if (!req.body.destinationUrl) {
            return res.status(400).json({
                success: false,
                message: "Destination URL is required",
            });
        }

        // ========================================
        // Generate Facebook Optimized Image
        // ========================================

        const resizedImage = await sharp(req.file.buffer)
            .resize({
                width: 420,
                height: 420,
                fit: "inside",
                withoutEnlargement: true,
            })
            .png()
            .toBuffer();

        const optimizedBuffer = await sharp({
    create: {
        width: 1200,
        height: 630,
        channels: 3,
        background: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
})
.composite([
    {
        input: resizedImage,
        gravity: "center",
    },
])
.jpeg({
    quality: 100,
    mozjpeg: true,
})
.toBuffer();

const meta = await sharp(optimizedBuffer).metadata();

console.log("OUTPUT SIZE:", meta.width, meta.height);
                    // ========================================
        // Upload Optimized Image
        // ========================================

        const filename = `previews/${randomUUID()}.jpg`;

        const file = bucket.file(filename);

        await file.save(optimizedBuffer, {
            metadata: {
                contentType: "image/jpeg",
            },
        });

        await file.makePublic();

        const imageUrl =
            `https://storage.googleapis.com/${bucket.name}/${filename}`;

        // ========================================
        // Generate Short Code
        // ========================================

        const slug = generateSlug();

        const shortUrl =
            `https://forge.gentlewarrior.world/${slug}`;
                    // ========================================
        // Save Link
        // ========================================

        await db.collection("links").doc(slug).set({
            slug,
            destinationUrl: req.body.destinationUrl,
            imageUrl,
            createdAt: new Date(),
        });

        // ========================================
        // Response
        // ========================================

        return res.json({
            success: true,
            shortUrl,
            slug,
            imageUrl,
            destinationUrl: req.body.destinationUrl,
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            error: err.message,
        });

    }

});

module.exports = router;