// Read the webflow-simple.js file and execute it to get the class
const fs = require('fs');
const webflowScript = fs.readFileSync('./webflow-simple.js', 'utf8');
eval(webflowScript);

async function createNewEjendomFolders() {
    try {
        const webflow = new SimpleWebflowManager("INDSÆT_DIN_API_TOKEN_HER", "686383aa51b13c9f891f8227");
        
        console.log("🏗️ OPRETTER HERMODSGADE OG DORTHEAVEJ MAPPER I WEBFLOW\n");
        
        // Test connection
        console.log("🔗 Tester Webflow forbindelse...");
        await webflow.listSites();
        console.log("✅ Webflow forbindelse OK\n");
        
        // Find the main "Ejendomme" folder
        const folders = await webflow.listAssetFolders();
        const ejendommeFolder = folders.find(folder => 
            folder.displayName === 'Ejendomme' && !folder.parentFolder
        );
        
        if (!ejendommeFolder) {
            console.error("❌ Ejendomme hovedfolder ikke fundet!");
            return;
        }
        
        console.log(`📂 Fundet Ejendomme folder (ID: ${ejendommeFolder.id})\n`);
        
        // Define new properties to create
        const newEjendomme = [
            {
                name: 'Hermodsgade',
                etager: [0, 1, 2, 3, 4]  // Etage 0-4
            },
            {
                name: 'Dortheavej', 
                etager: [0, 1, 2, 3, 4]  // Etage 0-4
            }
        ];
        
        // Create folders for each new ejendom
        for (const ejendom of newEjendomme) {
            console.log(`🏢 Opretter ${ejendom.name} mapper...\n`);
            
            try {
                // 1. Create main ejendom folder
                console.log(`📁 Opretter hovedfolder: ${ejendom.name}`);
                const mainFolder = await webflow.createAssetFolder(ejendom.name, ejendommeFolder.id);
                console.log(`✅ ${ejendom.name} hovedfolder oprettet (ID: ${mainFolder.id})`);
                
                // 2. Create etage subfolders
                for (const etage of ejendom.etager) {
                    const etageName = `Etage_${etage}`;
                    console.log(`📁 Opretter: ${etageName}`);
                    
                    try {
                        const etageFolder = await webflow.createAssetFolder(etageName, mainFolder.id);
                        console.log(`✅ ${etageName} oprettet (ID: ${etageFolder.id})`);
                        
                        // Add delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                    } catch (etageError) {
                        console.error(`❌ Fejl ved oprettelse af ${etageName}:`, etageError.message);
                    }
                }
                
                console.log(`🎉 ${ejendom.name} komplet!\n`);
                
                // Add delay between ejendomme
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (mainError) {
                console.error(`❌ Fejl ved oprettelse af ${ejendom.name} hovedfolder:`, mainError.message);
            }
        }
        
        console.log("🏆 ALLE MAPPER OPRETTET!\n");
        
        // Show final folder structure
        console.log("📊 Verificerer oprettede mapper...");
        const finalFolders = await webflow.listAssetFolders();
        
        console.log("\n📂 Komplet mappestruktur:");
        
        // Show Ejendomme root
        console.log("  📁 Ejendomme");
        
        // Find and show all main ejendom folders
        const mainEjendomFolders = finalFolders.filter(folder => 
            folder.parentFolder === ejendommeFolder.id
        );
        
        mainEjendomFolders.forEach(mainFolder => {
            console.log(`    📁 ${mainFolder.displayName}`);
            
            // Find etage folders for this ejendom
            const etagefolders = finalFolders.filter(folder => 
                folder.parentFolder === mainFolder.id
            );
            
            etagefolders.forEach(etageFolder => {
                console.log(`      📁 ${etageFolder.displayName}`);
            });
        });
        
        console.log("\n✅ Mappestruktur komplet oprettet!");
        
    } catch (error) {
        console.error("❌ Oprettelse fejlede:", error.message);
    }
}

createNewEjendomFolders();
