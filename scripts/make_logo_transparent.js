const Jimp = require('jimp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/logo.png');
const outputPath = path.join(__dirname, '../public/logo-transparent.png');

async function processImage() {
    try {
        console.log(`Reading image from ${inputPath}...`);
        const image = await Jimp.read(inputPath);

        console.log('Processing image...');
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            const alpha = this.bitmap.data[idx + 3];

            // Check if pixel is white (or very close to white)
            if (red > 240 && green > 240 && blue > 240) {
                // Make it transparent
                this.bitmap.data[idx + 3] = 0;
            }
        });

        console.log(`Saving image to ${outputPath}...`);
        await image.writeAsync(outputPath);
        console.log('Done!');
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

processImage();
