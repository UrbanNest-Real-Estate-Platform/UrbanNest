require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Property = require('./models/Property');
const User = require('./models/User');

const BATCH_SIZE = 1000;

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Find or create a dummy user
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                name: "Admin User",
                email: "admin@urbannest.com",
                password: "password123",
                phoneNumber: "1234567890",
                cityOfResidence: "Gurgaon"
            });
            console.log('Created dummy user:', user.email);
        } else {
            console.log('Found existing user:', user.email);
        }

        const ownerId = user._id;

        const results = [];
        console.log('Parsing CSV...');
        
        fs.createReadStream('../gurgaon_10k.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`Parsed ${results.length} rows. Preparing documents...`);
                
                const docs = [];
                for (const row of results) {
                    try {
                        if (!row.PROP_HEADING || !row.DESCRIPTION || !row.MIN_PRICE) continue;
                        
                        let propertyType = 'Apartment';
                        const typeRaw = (row.PROPERTY_TYPE || '').toLowerCase();
                        if (typeRaw.includes('villa') || typeRaw.includes('house')) propertyType = 'Villa';
                        else if (typeRaw.includes('land') || typeRaw.includes('plot')) propertyType = 'Plot';
                        else if (typeRaw.includes('commercial') || typeRaw.includes('shop') || typeRaw.includes('office')) propertyType = 'Commercial';

                        let listingType = 'sell';
                        if (row.PREFERENCE === 'R') listingType = 'rent';
                        else if (row.PREFERENCE === 'A') listingType = 'auction';

                        let lat = 0;
                        let lng = 0;
                        if (row.MAP_DETAILS) {
                            const latMatch = row.MAP_DETAILS.match(/'LATITUDE':\s*'([^']+)'/);
                            const lngMatch = row.MAP_DETAILS.match(/'LONGITUDE':\s*'([^']+)'/);
                            if (latMatch) lat = parseFloat(latMatch[1]);
                            if (lngMatch) lng = parseFloat(lngMatch[1]);
                        }

                        // ensure coordinates are valid numbers and somewhat reasonable for India
                        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                            lat = 28.4595; // Default Gurgaon lat
                            lng = 77.0266; // Default Gurgaon lng
                        }

                        let areaSqft = parseFloat(row.SUPERBUILTUP_SQFT) || parseFloat(row.CARPET_SQFT) || parseFloat(row.MIN_AREA_SQFT) || 0;
                        // Some data might not have areaSqft, schema says it's required
                        if (!areaSqft) areaSqft = 1000;

                        const doc = {
                            ownerId,
                            title: row.PROP_HEADING || 'Property in Gurgaon',
                            description: row.DESCRIPTION || 'No description provided.',
                            propertyType,
                            listingType,
                            totalPrice: parseFloat(row.MIN_PRICE) || 0,
                            isNegotiable: false,
                            status: "Available",
                            specs: {
                                areaSqft,
                                superBuiltUpSqft: parseFloat(row.SUPERBUILTUP_SQFT) || null,
                                bedrooms: parseInt(row.BEDROOM_NUM) || null,
                                bathrooms: parseInt(row.BATHROOM_NUM) || null,
                                yearBuilt: null
                            },
                            address: {
                                street: row.SOCIETY_NAME || row.LOCALITY_WO_CITY || '',
                                locality: row.LOCALITY || 'Gurgaon',
                                city: row.CITY || 'Gurgaon',
                                state: 'Haryana',
                                zipCode: ''
                            },
                            location: {
                                type: "Point",
                                coordinates: [lng, lat]
                            },
                            images: row.PHOTO_URL ? [row.PHOTO_URL] : []
                        };

                        docs.push(doc);
                    } catch (err) {
                        // skip row on error
                    }
                }

                console.log(`Prepared ${docs.length} documents. Inserting into DB...`);
                
                let inserted = 0;
                for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                    const batch = docs.slice(i, i + BATCH_SIZE);
                    try {
                        await Property.insertMany(batch, { ordered: false });
                        inserted += batch.length;
                        console.log(`Inserted ${inserted}/${docs.length}`);
                    } catch (err) {
                        console.error('Error inserting batch:', err.message);
                        // Continuing even if there's an error in one batch, e.g. duplicate key or validation error
                    }
                }

                console.log('Population complete!');
                mongoose.disconnect();
                process.exit(0);
            });
    } catch (err) {
        console.error('Error in script:', err);
        mongoose.disconnect();
        process.exit(1);
    }
}

run();