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
        
        // Erstat Vesterbrogade mappenavne
        console.log("🔧 Erstatter Vesterbrogade mappenavne...\n");
        
        const nameMapping = {
            'Vesterbrogade_Etage_1': 'Etage_1',
            'Vesterbrogade_Etage_2': 'Etage_2',
            'Vesterbrogade_Etage_3': 'Etage_3',
            'Vesterbrogade_Etage_4': 'Etage_4',
            'Vesterbrogade_Etage_5': 'Etage_5'
        };
        
        await webflow.replaceFolderNames(nameMapping, 'Vesterbrogade');
        
        console.log("✅ Test fuldført succesfuldt!");
        
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
