<!-- Add Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js"></script>

<script>
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGtd7tZyrr6FNMDdH6KGJMgQJ9qkyDWI0",
    authDomain: "newwebapp-17077.firebaseapp.com",
    databaseURL: "https://newwebapp-17077-default-rtdb.firebaseio.com",
    projectId: "newwebapp-17077",
    storageBucket: "newwebapp-17077.appspot.com",
    messagingSenderId: "34654677405",
    appId: "1:34654677405:web:dcfe8f03fe689cef1be774"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// Function to post new alert
function postAlert() {
    const alertMessage = document.getElementById('alertMessage').value;
    const username = "currentUser"; // Replace this with the logged-in user's username
    const timestamp = new Date().toLocaleString();

    if (alertMessage) {
        const newAlertKey = db.ref().child('alerts').push().key;
        const newAlertData = {
            id: newAlertKey,
            message: alertMessage,
            username: username,
            timestamp: timestamp,
            likes: 0,
            dislikes: 0,
            comments: []
        };

        // Push the new alert to Firebase database
        db.ref('alerts/' + newAlertKey).set(newAlertData, (error) => {
            if (error) {
                console.error('Error posting alert:', error);
            } else {
                document.getElementById('alertMessage').value = ''; // Clear the input box
            }
        });
    }
}

// Function to load alerts in real-time
function loadAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = ''; // Clear the container first

    db.ref('alerts').on('value', (snapshot) => {
        const alerts = snapshot.val();
        for (const alertKey in alerts) {
            const alert = alerts[alertKey];

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.innerHTML = `
                <p><strong>${alert.username}</strong> (${alert.timestamp})</p>
                <p>${alert.message}</p>
                <button onclick="reactToAlert('${alert.id}', 'like')">👍 ${alert.likes || 0}</button>
                <button onclick="reactToAlert('${alert.id}', 'dislike')">👎 ${alert.dislikes || 0}</button>
                <div>
                    <input type="text" id="comment-input-${alert.id}" placeholder="Add a comment"/>
                    <button onclick="addComment('${alert.id}')">Comment</button>
                </div>
                <div id="comments-${alert.id}">
                    ${alert.comments.map(comment => `<p>${comment}</p>`).join('')}
                </div>
            `;
            alertsContainer.appendChild(alertDiv);
        }
    });
}

// Call this function to load alerts in real-time when the page loads
window.onload = function() {
    loadAlerts();
}

// Function to handle reactions to alerts (like/dislike)
function reactToAlert(alertId, reactionType) {
    const alertRef = db.ref('alerts/' + alertId);

    alertRef.once('value').then(snapshot => {
        const alert = snapshot.val();
        if (reactionType === 'like') {
            alert.likes = (alert.likes || 0) + 1;
        } else if (reactionType === 'dislike') {
            alert.dislikes = (alert.dislikes || 0) + 1;
        }
        alertRef.set(alert); // Update the alert in Firebase
    });
}

// Function to add a comment to an alert
function addComment(alertId) {
    const commentInput = document.getElementById(`comment-input-${alertId}`);
    const comment = commentInput.value.trim();

    if (comment) {
        const alertRef = db.ref('alerts/' + alertId);
        alertRef.once('value').then(snapshot => {
            const alert = snapshot.val();
            alert.comments = alert.comments || [];
            alert.comments.push(comment);

            alertRef.set(alert); // Update the alert with new comment in Firebase
            commentInput.value = ''; // Clear comment input box
        });
    }
}
</script>
