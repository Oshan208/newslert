// script.js

let mediaRecorder;
let audioChunks = [];
let notifications = []; // Array to store notifications
const channel = new BroadcastChannel('news_channel');

// Function to toggle notification menu
function toggleNotifications() {
    const notificationsMenu = document.getElementById('notifications-menu');
    notificationsMenu.style.display = notificationsMenu.style.display === 'none' ? 'block' : 'none';
}

// Function to set username
function setUsername() {
    const username = document.getElementById('usernameInput').value;
    if (username) {
        localStorage.setItem('username', username);
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('newsSection').style.display = 'block';
        loadAlerts();
    } else {
        alert('Please enter a username.');
    }
}

// Function to load alerts from localStorage
function loadAlerts() {
    const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    const newAlertsList = document.getElementById('newAlertsList');
    const oldAlertsList = document.getElementById('oldAlertsList');

    newAlertsList.innerHTML = '';
    oldAlertsList.innerHTML = '';

    alerts.forEach(alert => {
        const li = createAlertElement(alert);
        
        const alertDate = new Date(alert.time);
        const now = new Date();
        const hoursDifference = (now - alertDate) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            newAlertsList.appendChild(li); // New alerts
        } else {
            oldAlertsList.appendChild(li); // Old alerts
        }
    });
}

// Function to create alert element
function createAlertElement(alert) {
    const li = document.createElement('li');
    li.className = 'alert';
    li.innerHTML = `
        <div>
            <strong>${alert.username}</strong> - <em>${alert.time}</em>
            <button onclick="deleteAlert('${alert.id}')">Delete</button>
            <button onclick="reportAlert('${alert.id}')">Report</button>
        </div>
        <p>${alert.message}</p>
        ${alert.imageUrl ? `<img src="${alert.imageUrl}" alt="Alert Image" />` : ''}
        ${alert.audioUrl ? `<audio controls src="${alert.audioUrl}"></audio>` : ''}
        <div>
            <button onclick="reactToAlert('${alert.id}', 'like')">👍 Like <span id="like-count-${alert.id}">${alert.likes || 0}</span></button>
            <button onclick="reactToAlert('${alert.id}', 'dislike')">👎 Dislike <span id="dislike-count-${alert.id}">${alert.dislikes || 0}</span></button>
        </div>
        <div>
            <input type="text" id="comment-input-${alert.id}" placeholder="Add a comment" class="comment-input">
            <button onclick="addComment('${alert.id}')">Comment</button>
        </div>
        <ul id="comments-${alert.id}">
            ${alert.comments ? alert.comments.map(comment => `<li>${comment}</li>`).join('') : ''}
        </ul>
    `;
    
    if (alert.reportCount && alert.reportCount > 0) {
        li.innerHTML += `<p>Reported ${alert.reportCount} times</p>`;
    }
    
    return li;
}

// Function to add an alert
function addAlert() {
    const username = localStorage.getItem('username');
    const message = document.getElementById('alertMessage').value;
    const imageUrl = document.getElementById('imageUrl').value; // Get image URL
    const time = new Date().toLocaleString();
    const audioUrl = localStorage.getItem('audioUrl') || ''; // Get audio URL from localStorage

    const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    const alertId = new Date().getTime().toString(); // Unique ID for each alert

    const newAlert = { 
        id: alertId, 
        username, 
        message, 
        time, 
        imageUrl, 
        audioUrl, 
        likes: 0, 
        dislikes: 0, 
        comments: [], 
        reportCount: 0 // Initialize report count
    };

    alerts.push(newAlert);
    localStorage.setItem('alerts', JSON.stringify(alerts));
    document.getElementById('alertMessage').value = '';
    document.getElementById('imageUrl').value = ''; // Clear image URL input
    localStorage.removeItem('audioUrl'); // Clear audio URL from localStorage
    
    // Broadcast the new alert
    channel.postMessage(newAlert);
    
    // Add notification
    addNotification(`New alert posted: "${message}"`);
    loadAlerts();
}

// Function to delete an alert
function deleteAlert(alertId) {
    let alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    alerts = alerts.filter(alert => alert.id !== alertId);
    localStorage.setItem('alerts', JSON.stringify(alerts));
    loadAlerts();
}

// Function to report an alert
function reportAlert(alertId) {
    let alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    const alert = alerts.find(alert => alert.id === alertId);

    alert.reportCount = (alert.reportCount || 0) + 1; // Increment report count

    if (alert.reportCount >= 10) {
        alerts = alerts.filter(a => a.id !== alertId);
        localStorage.setItem('alerts', JSON.stringify(alerts));
        alertOwner(alert.username, alert.message); // Notify owner
        addNotification(`Alert deleted due to multiple reports: "${alert.message}"`);
    } else {
        localStorage.setItem('alerts', JSON.stringify(alerts));
    }

    loadAlerts();
}

// Function to notify alert owner
function alertOwner(owner, message) {
    console.log(`Alert Deleted: ${message} has been deleted due to reports.`);
}

// Function to add notification
function addNotification(message) {
    const notificationsList = document.getElementById('notifications-list');
    notifications.push(message);
    const notificationCount = document.getElementById('notification-count');
    notificationCount.innerText = notifications.length;

    const li = document.createElement('li');
    li.innerText = message;
    notificationsList.appendChild(li);
}

// Function to check input and show hot news message
function checkInput() {
    const input = document.getElementById('alertMessage').value;
    document.getElementById('hotNewsMessage').style.display = input ? 'block' : 'none';
}

// Function to handle reactions to alerts
function reactToAlert(alertId, reactionType) {
    const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    const alert = alerts.find(alert => alert.id === alertId);

    if (reactionType === 'like') {
        alert.likes = (alert.likes || 0) + 1;
    } else if (reactionType === 'dislike') {
        alert.dislikes = (alert.dislikes || 0) + 1;
    }

    localStorage.setItem('alerts', JSON.stringify(alerts));
    loadAlerts();
}

// Function to add a comment
function addComment(alertId) {
    const commentInput = document.getElementById(`comment-input-${alertId}`);
    const comment = commentInput.value.trim();

    if (comment) {
        const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
        const alert = alerts.find(alert => alert.id === alertId);
        
        alert.comments.push(comment);
        localStorage.setItem('alerts', JSON.stringify(alerts));

        commentInput.value = '';
        loadAlerts(); // Refresh alerts to show new comment
    }
}

// Broadcast channel listener for new alerts
channel.onmessage = function(event) {
    const newAlert = event.data;
    addNotification(`New alert posted by ${newAlert.username}: "${newAlert.message}"`);
    loadAlerts(); // Reload alerts to show the new one
};

// Media recording functions (to be implemented)
function startRecording() {
    // Implement media recording
}

function stopRecording() {
    // Implement media recording stop
}
