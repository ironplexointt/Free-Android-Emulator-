// --- CENTRAL APPLICATION DATABASE STATE ---
let profileState = {
    isUserVerified: false,
    hardwareRAM: '4GB',
    hardwareStorage: '32GB',
    systemOS: 'Balava - Android 16',
    packageQueue: []
};

let webRTCPeer = null;
let commandChannel = null;

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
    
    // Automatically trigger WebRTC pipelines if user lands on workspace console
    if (screenId === 'config-screen') {
        connectToEmulatorStream();
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
    console.warn("Target architecture updated. System restart sequence required.");
}

function changeVolume(level) {
    const videoTarget = document.getElementById('emulator-video-container');
    if (videoTarget) {
        videoTarget.volume = level;
    }
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
    targetList.innerHTML = "";
    profileState.packageQueue.forEach(app => {
        const item = document.createElement('li');
        item.innerText = app;
        targetList.appendChild(item);
    });
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

// --- INTERACTIVE WebRTC AUDIO & VIDEO CONTROLLER ---
async function connectToEmulatorStream() {
    const videoViewport = document.getElementById('emulator-video-container');
    const loadingBlock = document.getElementById('stream-loader');
    if (!videoViewport) return;

    // Direct endpoint connection to your background WebRTC server instance
    const STREAM_ROUTER_URL = "https://your-backend-server-ip:80e0/v1/stream";

    try {
        webRTCPeer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        // Capture incoming unmuted hardware signals directly
        webRTCPeer.ontrack = (streamEvent) => {
            if (videoViewport.srcObject !== streamEvent.streams[0]) {
                videoViewport.srcObject = streamEvent.streams[0];
                if(loadingBlock) loadingBlock.style.opacity = '0'; 
                console.log("Hardware A/V streaming stream bound.");
            }
        };

        commandChannel = webRTCPeer.createDataChannel("input-events");
        attachInputPositionMapping(videoViewport);

        const internalOffer = await webRTCPeer.createOffer();
        await webRTCPeer.setLocalDescription(internalOffer);

        const signalRoute = await fetch(STREAM_ROUTER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sdp: internalOffer.sdp, type: internalOffer.type })
        });

        const remoteResolution = await signalRoute.json();
        await webRTCPeer.setRemoteDescription(new RTCSessionDescription(remoteResolution));

    } catch (failureContext) {
        console.error("Signaling handshake breakdown: ", failureContext);
        if(loadingBlock) loadingBlock.innerText = "Stream offline. Check backend service.";
    }
}

function attachInputPositionMapping(surfaceElement) {
    surfaceElement.addEventListener('mousedown', (clickContext) => {
        if (!commandChannel || commandChannel.readyState !== "open") return;

        const bounds = surfaceElement.getBoundingClientRect();
        const horizontalOffset = (clickContext.clientX - bounds.left) / bounds.width;
        const verticalOffset = (clickContext.clientY - bounds.top) / bounds.height;

        commandChannel.send(JSON.stringify({
            type: "pointerdown",
            x: horizontalOffset,
            y: verticalOffset
        }));
    });
}