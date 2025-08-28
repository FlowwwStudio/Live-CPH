// Load environment variables
require('dotenv').config();

// Read the webflow-simple.js file and execute it to get the class
const fs = require('fs');
const webflowScript = fs.readFileSync('./webflow-simple.js', 'utf8');
eval(webflowScript);

async function updateVesterbrogadeOnly() {
    try {
        // Initialize Webflow manager
        const apiToken = process.env.WEBFLOW_API_TOKEN || "INDSÆT_DIN_API_TOKEN_HER";
        const siteId = process.env.WEBFLOW_SITE_ID || "686383aa51b13c9f891f8227";
        
        let webflow;
        if (apiToken === "INDSÆT_DIN_API_TOKEN_HER") {
            console.log("⚠️ WEBFLOW_API_TOKEN ikke sat i .env - bruger hardcoded values fra webflow-simple.js");
            // Brug samme configuration som webflow-simple.js
            webflow = new SimpleWebflowManager("INDSÆT_DIN_API_TOKEN_HER", siteId);
        } else {
            webflow = new SimpleWebflowManager(apiToken, siteId);
        }
        
        // Test connection
        console.log("🔗 Tester Webflow forbindelse...");
        await webflow.listSites();
        console.log("✅ Webflow forbindelse OK\n");
        
        // VESTERBROGADE: Opdater alle etager med plantegning billeder
        console.log("🏢 VESTERBROGADE: Opdaterer alle etager med plantegning billeder...\n");
        
        // 1. Liste alle collections
        console.log("📊 Henter CMS collections...");
        await webflow.listCollections();
        console.log("");
        
        // 2. Definer alle Vesterbrogade etager (baseret på folder struktur)
        const vesterbrogatetager = [
            { etage: 1, displayName: '1. sal' },
            { etage: 2, displayName: '2. sal' },
            { etage: 3, displayName: '3. sal' },
            { etage: 4, displayName: '4. sal' },
            { etage: 5, displayName: '5. sal' }
        ];
        
        let vesterbrogadeTotalProcessed = 0;
        let vesterbrogadeTotalUpdated = 0;
        
        // 3. Proces hver Vesterbrogade etage
        for (const etageInfo of vesterbrogatetager) {
            console.log(`\n🏢 Behandler Vesterbrogade ${etageInfo.displayName} (Etage_${etageInfo.etage})...`);
            
            try {
                // Find Vesterbrogade parent folder først
                const vesterbroadgParent = await webflow.findFolderByName('Vesterbrogade');
                if (!vesterbroadgParent) {
                    console.log("❌ Vesterbrogade parent folder ikke fundet");
                    continue;
                }
                
                // Hent assets fra Vesterbrogade etage folder
                const folderName = `Etage_${etageInfo.etage}`;
                const pattern = new RegExp(`Lejlighed_${etageInfo.etage}_\\d+\\.svg`);
                
                // Søg specifikt under Vesterbrogade parent
                const folders = await webflow.listAssetFolders();
                const vesterbrogadeEtageFolder = folders.find(folder => 
                    folder.displayName === folderName && 
                    folder.parentFolder === vesterbroadgParent.id
                );
                
                if (!vesterbrogadeEtageFolder) {
                    console.log(`⚠️ ${folderName} folder ikke fundet under Vesterbrogade`);
                    continue;
                }
                
                const assets = await webflow.listAssetsInFolder(vesterbrogadeEtageFolder.id);
                const lejlighedAssets = assets.filter(asset => 
                    asset.displayName && pattern.test(asset.displayName)
                );
                
                if (lejlighedAssets.length > 0) {
                    console.log(`📂 Fundet ${lejlighedAssets.length} lejlighed SVG'er:`);
                    
                    // Opret mapping mellem lejlighed nummer og asset URL
                    const assetMappings = {};
                    lejlighedAssets.forEach(asset => {
                        const match = asset.displayName.match(new RegExp(`Lejlighed_${etageInfo.etage}_(\\d+)\\.svg`));
                        if (match) {
                            const lejlighedNummer = match[1];
                            const assetUrl = asset.hostedUrl || asset.url;
                            if (assetUrl) {
                                assetMappings[`Lejlighed_${etageInfo.etage}_${lejlighedNummer}`] = assetUrl;
                                console.log(`  ✅ ${asset.displayName}`);
                            }
                        }
                    });
                    
                    vesterbrogadeTotalProcessed += Object.keys(assetMappings).length;
                    
                    // Opdater CMS (kun hvis der er mappings)
                    if (Object.keys(assetMappings).length > 0) {
                        console.log(`🔄 Opdaterer ${Object.keys(assetMappings).length} lejligheder i CMS...`);
                        const result = await webflow.updatePlantegningBilleder('Vesterbrogade', etageInfo.displayName, assetMappings);
                        vesterbrogadeTotalUpdated += result.length;
                        
                        // Vent mellem etager for at undgå rate limiting
                        if (etageInfo.etage < 5) {
                            console.log("⏳ Venter 2 sekunder før næste etage...");
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                } else {
                    console.log(`⚠️ Ingen lejlighed SVG'er fundet i ${folderName}`);
                }
                
            } catch (error) {
                console.error(`❌ Fejl ved behandling af Vesterbrogade ${etageInfo.displayName}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Vesterbrogade komplet!`);
        console.log(`📊 Vesterbrogade statistik:`);
        console.log(`  - ${vesterbrogadeTotalProcessed} assets behandlet`);
        console.log(`  - ${vesterbrogadeTotalUpdated} CMS items opdateret`);
        console.log(`  - 5 etager (1.-5. sal) ✅`);
        
        console.log("\n✅ Vesterbrogade opdatering fuldført!");
        
    } catch (error) {
        console.error("❌ Vesterbrogade opdatering fejlede:", error.message);
    }
}

// Kør kun hvis filen kaldes direkte
if (require.main === module) {
    updateVesterbrogadeOnly();
}

module.exports = updateVesterbrogadeOnly;
