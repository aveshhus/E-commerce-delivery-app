const fs = require('fs');
const path = require('path');
const https = require('https');

const images = [
    { name: 'tomato.jpg', url: 'https://images.unsplash.com/photo-1546470427-b275a2667828?w=500&auto=format&fit=crop&q=60' }, // Tomato
    { name: 'onion.jpg', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60' }, // Onion
    { name: 'potato.jpg', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60' }, // Potato
    { name: 'banana.jpg', url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop&q=60' }, // Banana
    { name: 'apple.jpg', url: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=500&auto=format&fit=crop&q=60' }, // Apple
    { name: 'amul-milk.jpg', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60' }, // Milk (Generic)
    { name: 'bread.jpg', url: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&auto=format&fit=crop&q=60' }, // Bread
    { name: 'butter.jpg', url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60' }, // Butter
    { name: 'lays.jpg', url: 'https://images.unsplash.com/photo-1566478919030-26d81dd812de?w=500&auto=format&fit=crop&q=60' }, // Chips
    { name: 'coke.jpg', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60' }, // Coke
    { name: 'rice.jpg', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60' }, // Rice
    { name: 'toordal.jpg', url: 'https://images.unsplash.com/photo-1585996614457-377df492b45e?w=500&auto=format&fit=crop&q=60' }, // Dal (Yellow Lentils)
    { name: 'oil.jpg', url: 'https://images.unsplash.com/photo-1474979266404-7cadd259c308?w=500&auto=format&fit=crop&q=60' }, // Oil
    { name: 'dettol.jpg', url: 'https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?w=500&auto=format&fit=crop&q=60' }, // Soap (Generic)
    { name: 'mdh.jpg', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60' }, // Spices
    { name: 'banner-veggies.jpg', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60' },
    { name: 'banner-delivery.jpg', url: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=500&auto=format&fit=crop&q=60' },
    { name: 'banner-dairy.jpg', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=60' }
];

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(__dirname, '../uploads', filename));
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => { }); // Delete the file async. (But we don't check for this)
            console.error(`Error downloading ${filename}: ${err.message}`);
            reject(err);
        });
    });
};

const run = async () => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    console.log('Starting download of sample images...');

    // Download sequentially to avoid rate limiting or overwhelming network
    for (const img of images) {
        try {
            await downloadImage(img.url, img.name);
        } catch (e) {
            console.error(`Failed to download ${img.name}`);
        }
    }

    console.log('All downloads completed!');
};

run();
