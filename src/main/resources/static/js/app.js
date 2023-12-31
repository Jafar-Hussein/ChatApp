'use strict';

// DOM Elements
var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

// WebSocket and User Variables
var stompClient = null;
var username = null;

// Avatar Colors for Users
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

// Function to Connect to WebSocket Server
function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        // Hide username input page and show chat page
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        // Create WebSocket connection
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        // Connect to WebSocket server
        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

// Callback on Successful WebSocket Connection
function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    // Hide connecting message
    connectingElement.classList.add('hidden');
}

// Callback on WebSocket Connection Error
function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

// Function to Send a Chat Message
function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        // Create a chat message object
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        // Send the message to the server
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        // Clear the input field
        messageInput.value = '';
    }
    event.preventDefault();
}

// Callback to Handle Received Messages
function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        // Display a user joining event
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        // Display a user leaving event
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        // Display a regular chat message
        messageElement.classList.add('chat-message');

        // Create an avatar for the user
        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        // Display the username
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    // Display the message content
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    // Append the message element to the chat area and scroll to the bottom
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Function to Generate Avatar Color Based on User's Name
function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

// Event listeners for form submissions
usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
