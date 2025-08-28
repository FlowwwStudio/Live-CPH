// Read the webflow-simple.js file and execute it to get the class
const fs = require('fs');
const webflowScript = fs.readFileSync('./webflow-simple.js', 'utf8');
eval(webflowScript);

async function debugVesterbrogade() {
    try {
        const webflow = new SimpleWebflowManager("INDSÆT_DIN_API_TOKEN_HER", "686383aa51b13c9f891f8227");
        
        console.log("🔍 DEBUG: Tjekker Vesterbrogade lejligheder i CMS...\n");
        
        // Hent alle collections
        const collections = await webflow.listCollections();
        const lejlighedCollection = collections.find(c => c.displayName === 'Lejligheder');
        
        // Hent alle items
        const items = await webflow.getCollectionItems(lejlighedCollection.id);
        
        // Filtrer for Vesterbrogade items
        const vesterbrogadeItems = items.filter(item => 
            item.fieldData.name && 
            item.fieldData.name.toLowerCase().includes('vesterbrogade')
        );
        
        console.log(`📊 Fundet ${vesterbrogadeItems.length} Vesterbrogade lejligheder i CMS:`);
        vesterbrogadeItems.forEach((item, index) => {
            console.log(`  ${index + 1}. "${item.fieldData.name}" (ID: ${item.id})`);
        });
        
        if (vesterbrogadeItems.length === 0) {
            console.log("\n⚠️ Ingen Vesterbrogade lejligheder fundet!");
            console.log("📋 Viser de første 20 lejligheder for at se navneformatet:");
            items.slice(0, 20).forEach((item, index) => {
                console.log(`  ${index + 1}. "${item.fieldData.name}"`);
            });
        }
        
    } catch (error) {
        console.error("❌ Debug fejlede:", error.message);
    }
}

debugVesterbrogade();
