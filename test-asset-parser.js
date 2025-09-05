/**
 * Test script for asset filename parsing
 */

// Import the parsing function from main script
const WebflowAssetMatcher = require('./webflow-asset-matcher.js');

// Create test instance
const matcher = new WebflowAssetMatcher('dummy_token', 'dummy_site');

// Test filenames
const testFilenames = [
    'HER_Lejlighed_0_01.svg',
    'HER_Lejlighed_0_32.svg',
    'HER_Lejlighed_1_05.svg',
    'HER_Lejlighed_2_15.svg',
    'HER_Lejlighed_3_07.svg',
    'HER_Lejlighed_4_12.svg',
    'invalid_filename.svg',
    'HER_Wrong_Format.svg',
    'DOR_Lejlighed_2_03.svg',  // Different property
    'STR_Lejlighed_5_08.svg'   // Different property
];

console.log('=== TESTING ASSET FILENAME PARSER ===\n');

testFilenames.forEach(filename => {
    console.log(`Testing: ${filename}`);
    
    const parsed = matcher.parseAssetFilename(filename);
    
    if (parsed) {
        const apartmentId = matcher.generateApartmentId(parsed);
        console.log(`✅ Parsed successfully:`);
        console.log(`   Property Code: ${parsed.propertyCode}`);
        console.log(`   Floor: ${parsed.floor}`);
        console.log(`   Apartment Number: ${parsed.apartmentNumber}`);
        console.log(`   Generated ID: ${apartmentId}`);
    } else {
        console.log(`❌ Failed to parse filename`);
    }
    console.log('');
});

console.log('=== TEST COMPLETED ===');
