const fs = require('fs');

fetch('https://slisr-official-default-rtdb.firebaseio.com/messages.json', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        subject: "Database Connection Test",
        message: "This is an automated test to ensure the database can receive entries.",
        timestamp: Date.now(),
        status: "new"
    })
})
.then(response => response.json())
.then(data => {
    if (data.error) {
        console.error("FIREBASE REJECTED:", data.error);
    } else {
        console.log("SUCCESSFULLY ADDED:", data.name);
    }
})
.catch(error => {
    console.error("NETWORK ERROR:", error);
});
