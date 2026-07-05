// --- CENTRAL APPLICATION DATABASE STATE ---
let profileState = {
    isUserVerified: false,
    hardwareRAM: '4GB',
    hardwareStorage: '32GB',
    systemOS: 'Android 17',
    packageQueue: []
};

// --- INITIAL ENGINE TRIGGER ---
document.addEventListener("DOMContentLoaded", () => {
    loadCachedProfile();
    syncUserInterface();
});

// --- DYNAMIC LAYER ROUTING ---
function showScreen(screenId) {
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    const target = document.getElementById(screenId);
    if(target) {
        target.classList.add('active');
    }
    
    // Automatically execute baseline boot procedure on layout activation
    if (screenId === 'config-screen') {
        requestEmulatorReboot();
    }
}

function openSignIn() {
    document.getElementById('signin-modal').classList.add('open');
}

function handleSignIn(event) {
    event.preventDefault();
    profileState.isUserVerified = true;
    document.getElementById('signin-modal').classList.remove('open');
    saveCachedProfile();
    showScreen('config-screen');
}

// --- SPECIFICATION CHANGE CONTROL PANEL ---
function setRAM(size) {
    profileState.hardwareRAM = size;
    toggleActiveElementIndicator('ram-btn', size);
    saveCachedProfile();
}

function setStorage(capacity) {
    profileState.hardwareStorage = capacity;
    toggleActiveElementIndicator('storage-btn', capacity);
    saveCachedProfile();
}

function setAndroidVersion(versionLabel) {
    profileState.systemOS = versionLabel;
    saveCachedProfile();
    console.log(`State variation targeted: ${versionLabel}`);
}

function changeVolume(level) {
    console.log(`Hardware Volume updated to: ${level * 100}%`);
}

// --- TEST APP QUEUE SYSTEM ---
function addTestApp() {
    const appPackage = prompt("Inject Package Bundle (e.g. com.example.testapp):");
    if(appPackage) {
        profileState.packageQueue.push(appPackage);
        saveCachedProfile();
        renderAppDrawerUI();
    }
}

function toggleAppDrawerList() {
    const targetList = document.getElementById('installed-apps-list');
    targetList.classList.toggle('hidden-drawer');
}

function renderAppDrawerUI() {
    const targetList = document.getElementById('installed-apps-list');
    if(!targetList) return;
    targetList.innerHTML = "";
    profileState.packageQueue.forEach(app => {
        const item = document.createElement('li');
        item.innerText = app;
        targetList.appendChild(item);
    });
}

// --- CORE REBOOT ROUTER METHOD ---
function requestEmulatorReboot() {
    const iframe = document.getElementById('emulator-frame');
    const loadingBlock = document.getElementById('stream-loader');
    if (!iframe) return;

    // Show processing panel interface overlay
    if (loadingBlock) {
        loadingBlock.style.opacity = '1';
        loadingBlock.innerText = `Booting ${profileState.systemOS} (${profileState.hardwareRAM} RAM / ${profileState.hardwareStorage} Storage)...`;
    }

    // Mapping architectural targets to unique Docker background port assignments
    const versionPorts = {
        "Android 17": "8000", "Android 16": "8001", "Android 15": "8002",
        "Android 14": "8003", "Android 13": "8004", "Android 12": "8005",
        "Android 11": "8006", "Android 10": "8007", "Android 9": "8008", "Android 8": "8009"
    };

    const targetPort = versionPorts[profileState.systemOS] || "8000";

    // Simulate backend lifecycle delay to switch the active iframe interface
    setTimeout(() => {
        // Pointing dynamically to the targeted local container port
        iframe.src = `http://localhost:${targetPort}`;
        if (loadingBlock) loadingBlock.style.opacity = '0';
    }, 1800);
}

// --- PERSISTENCE UTILITIES ---
function saveCachedProfile() {
    localStorage.setItem('cloudDeviceConfig', JSON.stringify(profileState));
}

function loadCachedProfile() {
    const cache = localStorage.getItem('cloudDeviceConfig');
    if (cache) {
        profileState = JSON.parse(cache);
    }
}

function toggleActiveElementIndicator(classGroup, selectedText) {
    document.querySelectorAll(`.${classGroup}`).forEach(element => {
        if(element.innerText.trim() === selectedText) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

function syncUserInterface() {
    toggleActiveElementIndicator('ram-btn', profileState.hardwareRAM);
    toggleActiveElementIndicator('storage-btn', profileState.hardwareStorage);
    
    const versionPicker = document.getElementById('android-version-picker');
    if(versionPicker) versionPicker.value = profileState.systemOS;
    
    renderAppDrawerUI();
}