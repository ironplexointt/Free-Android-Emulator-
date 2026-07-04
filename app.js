function setProfile(profileType) {
    const stream = document.getElementById('emulator-stream');
    const hzDisplay = document.getElementById('current-hz');
    
    // Remove old classes
    stream.className = '';
    
    // Reset active button styling
    document.querySelectorAll('.profile-btn').forEach(btn => btn.classList.remove('active'));
    
    // Event listener target activation
    event.target.classList.add('active');

    // Handle profile logic
    if (profileType === 'LTE') {
        stream.classList.add('lte-mode');
        hzDisplay.innerText = '24Hz';
        // Note: Here you would also update your WebRTC frame-rate limits
    } else if (profileType === '5G') {
        stream.classList.add('fiveg-mode');
        hzDisplay.innerText = '60Hz';
    } else if (profileType === 'WiFi') {
        stream.classList.add('wifi-mode');
        hzDisplay.innerText = '120Hz';
    }
}