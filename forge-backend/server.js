const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const { db, bucket, auth } = require("./firebase");
const { randomUUID } = require("crypto");

const app = express();

app.use(cors({
    origin: "https://gentlewarrior.world"
}));

const upload = multer({
    storage: multer.memoryStorage(),
});

function generateSlug(length = 6) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let slug = "";

    for (let i = 0; i < length; i++) {
        slug += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return slug;
}

app.post("/generate", upload.single("image"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required",
            });
        }

        if (!req.body.destinationUrl) {
            return res.status(400).json({
                success: false,
                message: "Destination URL is required",
            });
        }

        // Verify Firebase Authentication token
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
        success: false,
        message: "Authentication required",
    });
}

const idToken = authHeader.split("Bearer ")[1];

let decodedToken;

try {
    decodedToken = await auth.verifyIdToken(idToken);
} catch (error) {
    console.error("Firebase token verification failed:", error);

    return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
    });
}

const uid = decodedToken.uid;

const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = userSnap.data();

        if (user.credits <= 0) {
            return res.status(400).json({
                success: false,
                message: "Insufficient credits",
            });
        }

        // ========================================
// Generate Facebook-optimized OG image
// ========================================

const fs = require("fs");

// Step 1 - Resize original image
const resizedImage = await sharp(req.file.buffer)
  .resize({
    width: 1160,
    height: 610,
    fit: "contain",
    withoutEnlargement: true,
})
  .png()
  .toBuffer();

// Step 2 - Create 1200x630 canvas
const optimizedBuffer = await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: {
  r: 13,
  g: 45,
  b: 20,
  alpha: 1,
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


// ========================================
// Upload
// ========================================

const filename = `previews/${randomUUID()}.jpg`;

const file = bucket.file(filename);

await file.save(optimizedBuffer, {
  metadata: {
    contentType: "image/jpeg",
  },
});

await file.makePublic();

const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        // Save link
        const slug = generateSlug();

        const shortUrl = `https://forge.gentlewarrior.world/${slug}`;

await db.collection("links").doc(slug).set({
    slug,
    destinationUrl: req.body.destinationUrl,
    imageUrl,
    createdAt: new Date(),
});

        // Deduct credits AFTER successful upload
        const remainingCredits = user.credits - 1;

        await userRef.update({
            credits: remainingCredits,
        });

        return res.json({
    success: true,
    linkId: slug,
    shortUrl,
    imageUrl,
    destinationUrl: req.body.destinationUrl,
    remainingSparks: remainingCredits,
});

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            error: err.message,
        });

    }

});

app.get("/:slug", async (req, res) => {

    try {

        const { slug } = req.params;

        const doc = await db.collection("links").doc(slug).get();

        if (!doc.exists) {
            return res.status(404).send("Link not found");
        }

        const link = doc.data();

        return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<title>FORGE</title>

<meta property="og:type" content="website">
<meta property="og:title" content=".">
<meta property="og:description" content="">
<meta property="og:url" content="https://forge.gentlewarrior.world/${slug}">

<meta property="og:image" content="${link.imageUrl}">
<meta property="og:image:secure_url" content="${link.imageUrl}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="FORGE Preview">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${link.imageUrl}">

</head>

<body>

Redirecting...

<script>
    window.location.replace("${link.destinationUrl}");
</script

</body>
</html>
`);

    } catch (err) {

        console.error(err);

        return res.status(500).send("Server Error");

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 FORGE Server running on port ${PORT}`);
});