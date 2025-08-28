// webflow-simple.js
// Simple Webflow Asset Manager using direct HTTP requests

class SimpleWebflowManager {
    constructor(apiToken, siteId) {
        this.apiToken = apiToken;
        this.siteId = siteId;
        this.baseUrl = 'https://api.webflow.com/v2';
    }

    // Helper method for making HTTP requests
    async makeRequest(endpoint, method = 'GET', body = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        console.log(`📡 ${method} ${url}`);
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`❌ Request fejlede:`, error.message);
            throw error;
        }
    }

    // Test connection - list sites
    async testConnection() {
        try {
            console.log("🔌 Tester forbindelse til Webflow...");
            const data = await this.makeRequest('/sites');
            
            console.log("✅ Forbindelse til Webflow fungerer!");
            console.log(`📊 Fundet ${data.sites?.length || 0} sites:`);
            
            if (data.sites) {
                data.sites.forEach(site => {
                    console.log(`  - ${site.displayName} (ID: ${site.id})`);
                    if (site.id === this.siteId) {
                        console.log("    ⭐ Dette er dit konfigurerede site!");
                    }
                });
            }
            
            return data;
        } catch (error) {
            console.error("❌ Forbindelsestest fejlede:", error.message);
            throw error;
        }
    }

    // List asset folders
    async listAssetFolders() {
        try {
            console.log("📁 Henter asset folders...");
            const data = await this.makeRequest(`/sites/${this.siteId}/asset_folders`);
            
            console.log(`✅ Fundet ${data.assetFolders?.length || 0} asset folders:`);
            
            if (data.assetFolders) {
                data.assetFolders.forEach(folder => {
                    const parent = folder.parentFolder ? ` (parent: ${folder.parentFolder})` : ' (root level)';
                    console.log(`  - ${folder.displayName}${parent}`);
                });
            }
            
            return data.assetFolders || [];
        } catch (error) {
            console.error("❌ Kunne ikke hente asset folders:", error.message);
            throw error;
        }
    }

    // Create asset folder
    async createAssetFolder(displayName, parentFolderId = null) {
        try {
            console.log(`🏗️ Opretter asset folder: ${displayName}`);
            
            const folderData = {
                displayName: displayName
            };

            if (parentFolderId) {
                folderData.parentFolder = parentFolderId;
                console.log(`   └── Under parent folder ID: ${parentFolderId}`);
            }

            const data = await this.makeRequest(
                `/sites/${this.siteId}/asset_folders`, 
                'POST', 
                folderData
            );
            
            console.log(`✅ Asset folder oprettet: ${data.displayName} (ID: ${data.id})`);
            return data;
            
        } catch (error) {
            console.error(`❌ Kunne ikke oprette folder '${displayName}':`, error.message);
            throw error;
        }
    }

    // Create folder structure
    async createFolderStructure(structure) {
        const results = [];
        console.log(`🏗️ Opretter mappestruktur med ${structure.length} mapper...\n`);
        
        for (let i = 0; i < structure.length; i++) {
            const folder = structure[i];
            
            try {
                let parentId = null;
                
                // Find parent folder ID if specified
                if (folder.parent) {
                    const parentFolder = results.find(f => f.displayName === folder.parent);
                    if (parentFolder) {
                        parentId = parentFolder.id;
                    } else {
                        console.log(`⚠️ Parent folder '${folder.parent}' ikke fundet for '${folder.displayName}' - springer over`);
                        continue;
                    }
                }

                const newFolder = await this.createAssetFolder(folder.displayName, parentId);
                results.push(newFolder);
                
                // Wait a bit between requests
                if (i < structure.length - 1) {
                    console.log("⏳ Venter 500ms...");
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
            } catch (error) {
                console.error(`❌ Fejl ved oprettelse af '${folder.displayName}':`, error.message);
            }
        }
        
        console.log(`\n🎉 Mappestruktur oprettet! ${results.length} mapper oprettet succesfuldt.`);
        return results;
    }

    // Find folder by name
    async findFolderByName(name) {
        const folders = await this.listAssetFolders();
        return folders.find(folder => folder.displayName === name);
    }

    // List assets in a specific folder
    async listAssetsInFolder(folderId) {
        try {
            console.log(`📁 Henter assets fra folder ID: ${folderId}`);
            const data = await this.makeRequest(`/sites/${this.siteId}/assets?folderId=${folderId}`);
            
            console.log(`✅ Fundet ${data.assets?.length || 0} assets i folder`);
            return data.assets || [];
        } catch (error) {
            console.error(`❌ Kunne ikke hente assets fra folder ${folderId}:`, error.message);
            throw error;
        }
    }

    // Get all assets with folder information
    async getAllAssets() {
        try {
            console.log("📁 Henter alle assets...");
            const data = await this.makeRequest(`/sites/${this.siteId}/assets`);
            
            console.log(`✅ Fundet ${data.assets?.length || 0} assets i alt`);
            return data.assets || [];
        } catch (error) {
            console.error("❌ Kunne ikke hente assets:", error.message);
            throw error;
        }
    }

    // Find assets by name pattern in specific folder
    async findAssetsByPattern(folderName, namePattern) {
        try {
            const folder = await this.findFolderByName(folderName);
            if (!folder) {
                console.error(`❌ Folder '${folderName}' ikke fundet`);
                return [];
            }

            const assets = await this.listAssetsInFolder(folder.id);
            const matchingAssets = assets.filter(asset => 
                asset.displayName && asset.displayName.match(namePattern)
            );

            console.log(`🔍 Fundet ${matchingAssets.length} assets der matcher pattern i '${folderName}'`);
            return matchingAssets;
        } catch (error) {
            console.error(`❌ Fejl ved søgning efter assets:`, error.message);
            return [];
        }
    }

    // Delete asset folder
    async deleteAssetFolder(folderId) {
        try {
            console.log(`🗑️ Sletter folder ID: ${folderId}`);
            
            await this.makeRequest(`/asset_folders/${folderId}`, 'DELETE');
            
            console.log(`✅ Folder slettet: ${folderId}`);
            
        } catch (error) {
            console.error(`❌ Kunne ikke slette folder ID ${folderId}:`, error.message);
            throw error;
        }
    }

    // Replace folders with new names (delete old, create new)
    async replaceFolderNames(nameMapping, parentFolderName) {
        console.log(`🔄 Erstatter ${Object.keys(nameMapping).length} mappenavne...\n`);
        
        // Get current folders
        const folders = await this.listAssetFolders();
        const parentFolder = folders.find(f => f.displayName === parentFolderName);
        
        if (!parentFolder) {
            console.error(`❌ Parent folder '${parentFolderName}' ikke fundet`);
            return [];
        }
        
        const results = [];
        
        // Step 1: Delete old folders
        console.log("🗑️ Sletter gamle mapper...");
        for (const oldName of Object.keys(nameMapping)) {
            try {
                const folder = folders.find(f => f.displayName === oldName);
                
                if (folder) {
                    await this.deleteAssetFolder(folder.id);
                    
                    // Wait a bit between requests
                    console.log("⏳ Venter 300ms...");
                    await new Promise(resolve => setTimeout(resolve, 300));
                } else {
                    console.log(`⚠️ Folder '${oldName}' ikke fundet - springer over`);
                }
            } catch (error) {
                console.error(`❌ Fejl ved sletning af '${oldName}':`, error.message);
            }
        }
        
        console.log("\n🏗️ Opretter nye mapper med korrekte navne...");
        
        // Step 2: Create new folders with correct names
        for (const [oldName, newName] of Object.entries(nameMapping)) {
            try {
                const newFolder = await this.createAssetFolder(newName, parentFolder.id);
                results.push(newFolder);
                
                // Wait a bit between requests
                console.log("⏳ Venter 300ms...");
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error(`❌ Fejl ved oprettelse af '${newName}':`, error.message);
            }
        }
        
        console.log(`\n🎉 Mapper erstattet! ${results.length} nye mapper oprettet succesfuldt.`);
        return results;
    }

    // CMS Methods
    // List all collections
    async listCollections() {
        try {
            console.log("📊 Henter CMS collections...");
            const data = await this.makeRequest(`/sites/${this.siteId}/collections`);
            
            console.log(`✅ Fundet ${data.collections?.length || 0} collections`);
            if (data.collections) {
                data.collections.forEach(collection => {
                    console.log(`  - ${collection.displayName} (ID: ${collection.id})`);
                });
            }
            return data.collections || [];
        } catch (error) {
            console.error("❌ Kunne ikke hente collections:", error.message);
            throw error;
        }
    }

    // Get items from a specific collection
    async getCollectionItems(collectionId, limit = 100) {
        try {
            console.log(`📊 Henter items fra collection: ${collectionId}`);
            let allItems = [];
            let offset = 0;
            let hasMore = true;
            
            // Get all items by paginating
            while (hasMore) {
                const data = await this.makeRequest(`/collections/${collectionId}/items?limit=${limit}&offset=${offset}`);
                const items = data.items || [];
                allItems = allItems.concat(items);
                
                console.log(`📥 Hentet ${items.length} items (total: ${allItems.length})`);
                
                if (items.length < limit) {
                    hasMore = false;
                } else {
                    offset += limit;
                }
                
                // Wait a bit between requests
                if (hasMore) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
            
            console.log(`✅ Fundet ${allItems.length} items i alt i collection`);
            return allItems;
        } catch (error) {
            console.error(`❌ Kunne ikke hente collection items:`, error.message);
            throw error;
        }
    }

    // Update collection item
    async updateCollectionItem(collectionId, itemId, fieldData) {
        try {
            console.log(`🔄 Opdaterer item ${itemId} i collection ${collectionId}`);
            
            const updateData = {
                fieldData: fieldData
            };

            const data = await this.makeRequest(
                `/collections/${collectionId}/items/${itemId}`, 
                'PATCH', 
                updateData
            );
            
            console.log(`✅ Item opdateret succesfuldt`);
            return data;
            
        } catch (error) {
            console.error(`❌ Kunne ikke opdatere collection item:`, error.message);
            throw error;
        }
    }

    // Find and update plantegning billede for lejligheder
    async updatePlantegningBilleder(ejendom, etage, assetMappings) {
        try {
            console.log(`🏠 Opdaterer plantegning billeder for ${ejendom} ${etage}...`);
            
            // Get collections to find the right one for lejligheder
            const collections = await this.listCollections();
            const lejlighedCollection = collections.find(c => 
                c.displayName.toLowerCase().includes('lejlighed') || 
                c.displayName.toLowerCase().includes('apartment')
            );
            
            if (!lejlighedCollection) {
                console.error("❌ Kunne ikke finde lejlighed collection");
                return [];
            }
            
            console.log(`📊 Bruger collection: ${lejlighedCollection.displayName}`);
            
            // Get all items from the collection
            const items = await this.getCollectionItems(lejlighedCollection.id);
            
            // Count items for info
            const strandlodsItems = items.filter(item => 
                item.fieldData.name && 
                item.fieldData.name.toLowerCase().includes('strandlodsvej')
            );
            console.log(`🔍 Fundet ${strandlodsItems.length} Strandlodsvej lejligheder i CMS`);
            
            const updatedItems = [];
            
            // Update each matching item
            for (const [lejlighedNummer, assetUrl] of Object.entries(assetMappings)) {
                console.log(`\n🔍 Søger efter item for: ${lejlighedNummer}`);
                
                // Debug: Show what we're looking for
                const numberMatch = lejlighedNummer.match(/\d+$/);
                if (numberMatch) {
                    if (ejendom.includes('Strandlodsvej')) {
                        const expectedPattern = `strandlodsvej, ${etage}, lejlighed ${numberMatch[0]}`;
                        console.log(`  🎯 Forventet pattern: "${expectedPattern}"`);
                    } else if (ejendom.includes('Vesterbrogade')) {
                        const expectedPattern = `vesterbrogade, ${etage}, lejlighed ${numberMatch[0]}`;
                        console.log(`  🎯 Forventet pattern: "${expectedPattern}"`);
                    }
                }
                
                // Try different matching strategies
                const item = items.find(item => {
                    if (!item.fieldData.name) return false;
                    
                    const itemName = item.fieldData.name.toLowerCase();
                    
                    // Strategy 1: Strandlodsvej format - "Strandlodsvej, [etage], lejlighed [nummer]"
                    if (ejendom.includes('Strandlodsvej')) {
                        const numberMatch = lejlighedNummer.match(/\d+$/);
                        if (numberMatch) {
                            const number = numberMatch[0];
                            const expectedPattern = `strandlodsvej, ${etage}, lejlighed ${number}`;
                            
                            if (itemName.includes(expectedPattern)) {
                                console.log(`  ✅ Strandlodsvej match found: ${item.fieldData.name}`);
                                return true;
                            }
                        }
                    }
                    
                    // Strategy 2: Vesterbrogade format - "Vesterbrogade, [etage], lejlighed [nummer]"
                    if (ejendom.includes('Vesterbrogade')) {
                        const numberMatch = lejlighedNummer.match(/\d+$/);
                        if (numberMatch) {
                            const number = numberMatch[0];
                            const expectedPattern = `vesterbrogade, ${etage}, lejlighed ${number}`;
                            
                            if (itemName.includes(expectedPattern)) {
                                console.log(`  ✅ Vesterbrogade match found: ${item.fieldData.name}`);
                                return true;
                            }
                        }
                    }
                    
                    // Strategy 3: Direct match (fallback)
                    if (itemName.includes(lejlighedNummer.toLowerCase())) {
                        console.log(`  ✅ Direct match found: ${item.fieldData.name}`);
                        return true;
                    }
                    
                    return false;
                });
                
                if (item) {
                    try {
                        // Update the plantegning billede field
                        const updatedFieldData = {
                            ...item.fieldData,
                            'plantegning-billede': assetUrl  // Adjust field name as needed
                        };
                        
                        const updatedItem = await this.updateCollectionItem(
                            lejlighedCollection.id, 
                            item.id, 
                            updatedFieldData
                        );
                        
                        updatedItems.push(updatedItem);
                        console.log(`✅ Opdateret ${lejlighedNummer}: ${assetUrl}`);
                        
                        // Wait between requests
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                    } catch (error) {
                        console.error(`❌ Fejl ved opdatering af ${lejlighedNummer}:`, error.message);
                    }
                } else {
                    console.log(`⚠️ Item for ${lejlighedNummer} ikke fundet`);
                }
            }
            
            console.log(`🎉 Opdateret ${updatedItems.length} lejligheder med plantegning billeder`);
            return updatedItems;
            
        } catch (error) {
            console.error("❌ Fejl ved opdatering af plantegning billeder:", error.message);
            throw error;
        }
    }
}

// Test and demo function
async function main() {
    // Check environment variables or use hardcoded values for testing
    const apiToken = process.env.WEBFLOW_API_TOKEN || "6601f4efe04eba1789f593ca669496f4410fe467142dc857b38960b8ea976103";
    const siteId = process.env.WEBFLOW_SITE_ID || "686383aa51b13c9f891f8227";
    
    if (!apiToken || apiToken === "INDSÆT_DIN_API_TOKEN_HER") {
        console.error("❌ WEBFLOW_API_TOKEN mangler eller er ikke sat");
        console.log("💡 Rediger webflow-simple.js og sæt din API token direkte i koden");
        console.log("💡 Eller sæt environment variabel: export WEBFLOW_API_TOKEN=dit_token");
        return;
    }
    
    if (!siteId) {
        console.error("❌ WEBFLOW_SITE_ID mangler");
        return;
    }
    
    console.log("🚀 Starter Webflow Asset Manager...\n");
    
    const webflow = new SimpleWebflowManager(apiToken, siteId);
    
    try {
        // Test connection
        await webflow.testConnection();
        console.log("");
        
        // List existing folders
        await webflow.listAssetFolders();
        console.log("");
        
        // Strandlodsvej: Opdater alle etager med plantegning billeder
        console.log("🏠 Strandlodsvej: Opdaterer alle etager med plantegning billeder...\n");
        
        // 1. Liste alle collections
        await webflow.listCollections();
        console.log("");
        
        // 2. Definer alle Strandlodsvej etager
        const strandlodsvejaEtager = [
            { etage: 0, displayName: 'stuen' },
            { etage: 1, displayName: '1. sal' },
            { etage: 2, displayName: '2. sal' },
            { etage: 3, displayName: '3. sal' },
            { etage: 4, displayName: '4. sal' },
            { etage: 5, displayName: '5. sal' },
            { etage: 6, displayName: '6. sal' },
            { etage: 7, displayName: '7. sal' }
        ];
        
        let totalProcessed = 0;
        let totalUpdated = 0;
        
        // 3. Proces hver etage
        for (const etageInfo of strandlodsvejaEtager) {
            console.log(`\n🏢 Behandler ${etageInfo.displayName} (Etage_${etageInfo.etage})...`);
            
            try {
                // Hent SVG assets fra etage folder
                const folderName = `Etage_${etageInfo.etage}`;
                const pattern = new RegExp(`Lejlighed_${etageInfo.etage}_\\d+\\.svg`);
                const assets = await webflow.findAssetsByPattern(folderName, pattern);
                
                if (assets.length > 0) {
                    console.log(`📂 Fundet ${assets.length} lejlighed SVG'er:`);
                    
                    // Opret mapping mellem lejlighed nummer og asset URL
                    const assetMappings = {};
                    assets.forEach(asset => {
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
                    
                    totalProcessed += Object.keys(assetMappings).length;
                    
                    // Opdater CMS (kun hvis der er mappings)
                    if (Object.keys(assetMappings).length > 0) {
                        console.log(`🔄 Opdaterer ${Object.keys(assetMappings).length} lejligheder i CMS...`);
                        const result = await webflow.updatePlantegningBilleder('Strandlodsvej', etageInfo.displayName, assetMappings);
                        totalUpdated += result.length;
                        
                        // Vent mellem etager for at undgå rate limiting
                        if (etageInfo.etage < 7) {
                            console.log("⏳ Venter 2 sekunder før næste etage...");
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                } else {
                    console.log(`⚠️ Ingen lejlighed SVG'er fundet i ${folderName}`);
                }
                
            } catch (error) {
                console.error(`❌ Fejl ved behandling af ${etageInfo.displayName}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Strandlodsvej (Etage 1-7) komplet!`);
        console.log(`📊 Statistik (Etager 1-7):`);
        console.log(`  - ${totalProcessed} assets behandlet`);
        console.log(`  - ${totalUpdated} CMS items opdateret`);
        
        // Special handling for Etage_0 - use direct URLs since assets are uploaded but not in correct folder
        console.log("\n🔧 SPECIAL: Opdaterer Etage_0 med direkte URL'er...");
        const etage0DirectMappings = {
            'Lejlighed_0_1': 'https://cdn.prod.website-files.com/686383aa51b13c9f891f8227/68af17826ece949646578971_Lejlighed_0_1.svg',
            'Lejlighed_0_2': 'https://cdn.prod.website-files.com/686383aa51b13c9f891f8227/68af1782ec60fe15a84d92c2_Lejlighed_0_2.svg',
            'Lejlighed_0_3': 'https://cdn.prod.website-files.com/686383aa51b13c9f891f8227/68af1782a95ad287011426e0_Lejlighed_0_3.svg',
            'Lejlighed_0_4': 'https://cdn.prod.website-files.com/686383aa51b13c9f891f8227/68af17827bd2e883120cb800_Lejlighed_0_4.svg',
            'Lejlighed_0_5': 'https://cdn.prod.website-files.com/686383aa51b13c9f891f8227/68af17817bd3c9dbb2980b38_Lejlighed_0_5.svg',
            'Lejlighed_0_6': 'https://cdn.prod.website-files.com/686383aa51b13c9f891f8227/68af178250f0742ebc874595_Lejlighed_0_6.svg',
            'Lejlighed_0_7': 'https://cdn.prod.website-files.com/686383aa51b13c9f891f8227/68af17825217e26adcb3493c_Lejlighed_0_7.svg'
        };
        
        console.log(`📋 Opdaterer ${Object.keys(etage0DirectMappings).length} Etage_0 lejligheder med direkte URL'er:`);
        Object.entries(etage0DirectMappings).forEach(([key, url]) => {
            console.log(`  ✅ ${key}`);
        });
        
        let etage0Count = 0;
        try {
            const etage0Result = await webflow.updatePlantegningBilleder('Strandlodsvej', 'stuen', etage0DirectMappings);
            etage0Count = etage0Result.length;
            console.log(`🎉 Etage_0 komplet: ${etage0Count} lejligheder opdateret`);
        } catch (etage0Error) {
            console.error("❌ Fejl ved Etage_0 opdatering:", etage0Error.message);
        }
        
        console.log(`\n🏆 TOTAL STRANDLODSVEJ RESULTAT:`);
        console.log(`📊 Komplet statistik (alle etager):`);
        console.log(`  - ${totalProcessed + 7} assets behandlet`);
        console.log(`  - ${totalUpdated + etage0Count} CMS items opdateret`);
        console.log(`  - Alle 8 etager (stuen + 1.-7. sal) ✅`);
        
        console.log("✅ Komplet Strandlodsvej opdatering fuldført!");
        
        // VESTERBROGADE: Opdater alle etager med plantegning billeder
        console.log("\n\n🏢 VESTERBROGADE: Opdaterer alle etager med plantegning billeder...\n");
        
        // 1. Liste alle collections (allerede hentet, men vis igen for kontekst)
        console.log("📊 Bruger samme CMS collection: Lejligheder");
        
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
        
        console.log(`\n🏆 SAMLET RESULTAT (STRANDLODSVEJ + VESTERBROGADE):`);
        console.log(`📊 Total statistik:`);
        console.log(`  - ${totalProcessed + 7 + vesterbrogadeTotalProcessed} assets behandlet`);
        console.log(`  - ${totalUpdated + etage0Count + vesterbrogadeTotalUpdated} CMS items opdateret`);
        console.log(`  - Strandlodsvej: 8 etager (stuen + 1.-7. sal) ✅`);
        console.log(`  - Vesterbrogade: 5 etager (1.-5. sal) ✅`);
        
        console.log("✅ KOMPLET opdatering af ALLE ejendomme fuldført!");
        
    } catch (error) {
        console.error("❌ Test fejlede:", error.message);
    }
}

// Export for use in other files
module.exports = SimpleWebflowManager;

// Run if called directly
if (require.main === module) {
    main();
}
