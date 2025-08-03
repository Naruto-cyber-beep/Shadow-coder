// js/serverLogic.js

let currentServer = null;
let username = localStorage.getItem("sc-username") || prompt("Enter your name:");
localStorage.setItem("sc-username", username);

// Check class/server
let userClass = localStorage.getItem("sc-class");
if (!userClass) {
  userClass = prompt("Enter your class (e.g., 8, 9, 10):");
  localStorage.setItem("sc-class", userClass);
}
const defaultClassServer = `Class ${userClass} Server`;

function loadServers() {
  const SL = document.getElementById("server-list");
  SL.innerHTML = "";
  const servers = JSON.parse(localStorage.getItem("user-servers") || `["${defaultClassServer}"]`);
  servers.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s[0];
    btn.title = s;
    btn.className = "w-10 h-10 bg-gray-700 rounded-full hover:bg-blue-600";
    btn.onclick = () => joinServer(s);
    SL.appendChild(btn);
  });
}

function joinServer(name) {
  currentServer = name;
  document.getElementById("current-server-name").innerText = name;
  const chatArea = document.getElementById("chat-area");
  chatArea.innerHTML = "";
  const chatRef = db.ref("serverChats/" + name);
  chatRef.off();
  chatRef.on("child_added", snap => {
    const msg = snap.val();
    const div = document.createElement("div");
    div.innerHTML = `<b>${msg.user}</b>: ${msg.text}`;
    chatArea.appendChild(div);
    chatArea.scrollTo(0, chatArea.scrollHeight);
  });
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const txt = input.value.trim();
  if (!txt || !currentServer) return;
  db.ref("serverChats/" + currentServer).push({
    user: username,
    text: txt
  });
  input.value = "";
}

function createServer() {
  const name = document.getElementById("new-server-name").value.trim();
  if (!name) return;
  let servers = JSON.parse(localStorage.getItem("user-servers") || `[]`);
  if (!servers.includes(name)) {
    servers.push(name);
    localStorage.setItem("user-servers", JSON.stringify(servers));
  }
  closeCreateServerModal();
  loadServers();
  joinServer(name);
}

function openCreateServerModal() {
  document.getElementById("create-server-modal").classList.remove("hidden");
}
function closeCreateServerModal() {
  document.getElementById("create-server-modal").classList.add("hidden");
}

window.onload = () => {
  loadServers();
  joinServer(defaultClassServer);
};
