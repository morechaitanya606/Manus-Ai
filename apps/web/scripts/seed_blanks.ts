import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CLOTHES_DIR = path.resolve(__dirname, '../../../clothes');

const CATEGORIES = [
    {
        name: 'Premium Cotton T-Shirt',
        folder: 'cotton',
        category: 'tshirt',
        base_price: 399,
        description: 'A classic, comfortable 100% cotton t-shirt built for daily wear.',
        fabric: 'Cotton',
        fit: 'Regular Fit',
        gsm: 240,
        features: ['Breathable', 'Soft touch', 'Pre-shrunk']
    },
    {
        name: 'Eco Bamboo T-Shirt',
        folder: 'bamboo',
        category: 'tshirt',
        base_price: 499,
        description: 'Ultra-soft, moisture-wicking bamboo fiber t-shirt. Eco-friendly and luxurious.',
        fabric: 'Bamboo',
        fit: 'Slim Fit',
        gsm: 220,
        features: ['Moisture-wicking', 'Anti-bacterial', 'Ultra-soft']
    },
    {
        name: 'Heavyweight Hemp T-Shirt',
        folder: 'hemp',
        category: 'tshirt',
        base_price: 599,
        description: 'Durable and sustainable hemp t-shirt that gets softer with every wash.',
        fabric: 'Hemp',
        fit: 'Relaxed Fit',
        gsm: 280,
        features: ['Highly durable', 'Sustainable', 'Textured feel']
    }
];

function formatColorName(filename: string) {
    const base = path.basename(filename, path.extname(filename));
    // Replace underscores with spaces and capitalize each word
    return base
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function uploadImage(filePath: string, categoryFolder: string, filename: string): Promise<string | null> {
    try {
        const rawBuffer = fs.readFileSync(filePath);

        console.log(`  -> Compressing ${filename}...`);
        const optimizedBuffer = await sharp(rawBuffer)
            .resize({ width: 1200, withoutEnlargement: true }) // Limit dimensions gently
            .webp({ quality: 80, effort: 4 })
            .toBuffer();

        const baseName = path.basename(filename, path.extname(filename));
        const newFilename = `${baseName}.webp`;
        const storagePath = `blanks/${categoryFolder}_${Date.now()}_${newFilename}`;

        // Upload to product-images bucket
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(storagePath, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: false
            });

        if (uploadError) {
            console.error(`Failed to upload ${newFilename}:`, uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(storagePath);

        return data.publicUrl;
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
        return null;
    }
}

async function run() {
    console.log('Starting seed process...');

    for (const cat of CATEGORIES) {
        console.log(`\nProcessing category: ${cat.category}`);
        const folderPath = path.join(CLOTHES_DIR, cat.folder);

        if (!fs.existsSync(folderPath)) {
            console.warn(`Folder not found: ${folderPath}`);
            continue;
        }

        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

        if (files.length === 0) {
            console.warn(`No images found in ${folderPath}`);
            continue;
        }

        for (const file of files) {
            const colorName = formatColorName(file);

            console.log(`Uploading ${colorName} (${file})...`);
            const publicUrl = await uploadImage(path.join(folderPath, file), cat.folder, file);

            if (publicUrl) {
                console.log(`  -> URL: ${publicUrl}`);

                // Insert individual product for this color
                const newProduct = {
                    name: `${cat.name} - ${colorName}`,
                    description: cat.description,
                    category: cat.category,
                    base_price: cat.base_price,
                    images: [publicUrl],
                    colors: [{ name: colorName, hex: '' }],
                    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
                    fabric: cat.fabric,
                    fit: cat.fit,
                    gsm: cat.gsm,
                    printing_methods: ['DTG', 'DTF', 'Screen Print'],
                    features: cat.features,
                    is_active: true
                };

                console.log(`Inserting product ${newProduct.name} into database...`);
                // Insert product into database
                const { error: dbError } = await supabase.from('products').insert([newProduct]);

                if (dbError) {
                    console.error(`Failed to insert product ${newProduct.name}:`, dbError);
                } else {
                    console.log(`Successfully added product: ${newProduct.name}!`);
                }
            }
        }
    }

    console.log('\nSeed process completed!');
}

async function start() {
    // Delete existing products first to avoid duplicates
    console.log('Clearing existing products...');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await run();
}

start().catch(console.error);
