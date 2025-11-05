/* jshint esversion: 11 */
/* globals lunr, console */

const PAGES = [
    'Pages/home.html', 'Pages/start-here.html',
    'Pages/Introduction/index.html', 'Pages/Introduction/1_KeyInfo.html', 'Pages/Introduction/2_Downloads.html', 'Pages/Introduction/3_ToolConfiguration.html', 'Pages/Introduction/4_AssetEditing.html', 'Pages/Introduction/5_Packaging.html', 'Pages/Introduction/6_UEProjectSetup.html', 'Pages/Introduction/7_FontMod.html', 'Pages/Introduction/8_LogicMods.html', 'Pages/Introduction/9_FinalNotes.html',
    'Pages/CoreFundamentals/index.html', 'Pages/CoreFundamentals/UsingFModel.html', 'Pages/CoreFundamentals/ExportingFModel.html', 'Pages/CoreFundamentals/ExportingUModel.html', 'Pages/CoreFundamentals/UModelAnimations.html', 'Pages/CoreFundamentals/AesKey.html', 'Pages/CoreFundamentals/ExtractingCooked.html', 'Pages/CoreFundamentals/ExtractingIoStore.html', 'Pages/CoreFundamentals/Extractingusmap.html',
    'Pages/BeginnerMods/index.html', 'Pages/BeginnerMods/UAssetGUI.html', 'Pages/BeginnerMods/HexEditing.html', 'Pages/BeginnerMods/EditingUmaps.html', 'Pages/BeginnerMods/DisablingObjects.html', 'Pages/BeginnerMods/UnrealPak.html', 'Pages/BeginnerMods/IoStorePacking.html', 'Pages/BeginnerMods/example1.html',
    'Pages/IntermediateMods/index.html', 'Pages/IntermediateMods/CreatingProject.html', 'Pages/IntermediateMods/CookingContent.html', 'Pages/IntermediateMods/ChangingTextures.html', 'Pages/IntermediateMods/ChangingSM.html', 'Pages/IntermediateMods/ChangingSK.html', 'Pages/IntermediateMods/MergingSK.html', 'Pages/IntermediateMods/ReplacingFonts.html', 'Pages/IntermediateMods/TranslationMod.html',
    'Pages/BlueprintMods/index.html', 'Pages/BlueprintMods/BpModsIntro.html', 'Pages/BlueprintMods/ConfigVariables.html', 'Pages/BlueprintMods/WorkingWithML.html', 'Pages/BlueprintMods/CustomAnimations.html', 'Pages/BlueprintMods/CreateWidget.html', 'Pages/BlueprintMods/BpReplication.html', 'Pages/BlueprintMods/ReplicatingMI.html', 'Pages/BlueprintMods/ModActorLifeCycle.html', 'Pages/BlueprintMods/CustomLogger.html', 'Pages/BlueprintMods/GeneratingUHT.html', 'Pages/BlueprintMods/UEClasses.html',
    'Pages/AdvancedMods/index.html', 'Pages/AdvancedMods/findingPointers.html', 'Pages/AdvancedMods/findingPointers2.html',
    'Pages/ExpertMods/index.html',
    'Pages/GameSpecific/index.html', 'Pages/GameSpecific/GameMemory_index.html', 'Pages/GameSpecific/GameMenus.html', 'Pages/GameSpecific/GameSaves.html', 'Pages/GameSpecific/Hotkeys.html',
    'Pages/Tools/index.html', 'Pages/Tools/BlenderImportAnimations.html', 'Pages/Tools/BlenderImportModels.html', 'Pages/Tools/BlenderImportTextures.html', 'Pages/Tools/SubstanceExport.html', 'Pages/Tools/SubstanceImportTextures.html',
    'Pages/host-server.html',
    'Pages/mod-manager.html',
    'Pages/upload-mod.html',
    'Pages/credits.html'
];

let idx;
const searchBox = document.getElementById('searchBox');
const resultsEl = document.getElementById('searchResults');
let searchData = {};

async function buildIndex() {
    if (typeof lunr === 'undefined') {
        console.error('Lunr search library is not loaded');
        return;
    }
    
    const responses = await Promise.all(
        PAGES.map(page => 
            fetch('./' + page)
                .catch(err => {
                    console.warn(`Failed to fetch ${page}:`, err);
                    return null;
                })
        )
    );
    
    const texts = await Promise.all(
        responses.map(async (res, index) => {
            if (!res || !res.ok) {
                return null;
            }
            try {
                return await res.text();
            } catch (err) {
                console.warn(`Failed to parse ${PAGES[index]}:`, err);
                return null;
            }
        })
    );

    idx = lunr(function () {
        this.ref('path');
        this.field('title');
        this.field('body');
        
        texts.forEach((text, i) => {
            if (!text) return;
            
            const path = PAGES[i];
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const title = doc.querySelector('title')?.textContent || path.split('/').pop().replace('.html', '');
            const body = doc.body?.textContent || '';
            
            this.add({ path, title, body });
            searchData[path] = { title };
        });
    });
}

function performSearch(query) {
    if (!query) {
        resultsEl.hidden = true;
        return;
    }
    if (!idx) {
        return;
    }
    const results = idx.search(query);
    displayResults(results);
}

function displayResults(results) {
    if (results.length === 0) {
        resultsEl.innerHTML = `<div class="search-item">No results found</div>`;
        resultsEl.hidden = false;
        return;
    }

    const frag = document.createDocumentFragment();
    results.slice(0, 10).forEach(result => {
        const path = result.ref;
        const data = searchData[path];
        const item = document.createElement('div');
        item.className = 'search-item';
        item.textContent = data.title;
        item.dataset.path = path;
        frag.appendChild(item);
    });

    resultsEl.innerHTML = '';
    resultsEl.appendChild(frag);
    resultsEl.hidden = false;
}

export function initSearch() {
    if (!searchBox || !resultsEl) return;

    if (typeof lunr === 'undefined') {
        console.error('Lunr search library is not loaded');
        return;
    }

    buildIndex().catch((err) => {
        console.error('Failed to build search index:', err);
    });

    searchBox.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    searchBox.addEventListener('focus', () => {
        if (searchBox.value) {
            resultsEl.hidden = false;
        }
    });

    document.addEventListener('click', (e) => {
        if (!resultsEl.contains(e.target) && e.target !== searchBox) {
            resultsEl.hidden = true;
        }
    });

    resultsEl.addEventListener('click', (e) => {
        const item = e.target.closest('.search-item');
        if (item && item.dataset.path) {
            location.hash = '#' + item.dataset.path;
            resultsEl.hidden = true;
            searchBox.value = '';
        }
    });
}
