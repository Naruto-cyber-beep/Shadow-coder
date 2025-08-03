let username = localStorage.getItem("sc-username") || prompt("Enter your name:");
localStorage.setItem("sc-username", username);

let userClass = localStorage.getItem("sc-class");
if (!userClass) {
  userClass = prompt("Enter your class (8, 9, 10...):");
  localStorage.setItem("sc-class", userClass);
}
const defaultClassServer = `Class ${userClass} Server`;

function loadServers() {
  const EL = document.getElementById("server-list");
  EL.innerHTML = "";
  const servers = JSON.parse(localStorage.getItem("user-servers") || `["${defaultClassServer}"]`);
  servers.forEach((s, i) => {
    const b = document.createElement("button");
    b.textContent = s[0];
    b.title = s;
    b.className = "bg-gray-700 rounded-full w-10 h-10 text-lg hover:bg-blue-600";
    b.onclick = () => joinServer(s);
    EL.appendChild(b);
  });
}
function joinServer(s) {
  window.currentServer = s;
  document.getElementById("server-name").innerText = s;
  let area = document.getElementById("chat-area");
  area.innerHTML = "";
  // Chat load via Firebase
  const ref = fbdb.ref("serverChats/" + s);
  ref.off();
  ref.on("child_added", snap => {
    let m = snap.val();
    let d = document.createElement("div");
    d.innerHTML = `<b>${m.user}</b>: ${m.text}`;
    area.appendChild(d);
    area.scrollTo(0, area.scrollHeight);
  });
}
function sendMessage() {
  let txt = document.getElementById("chat-input").value.trim();
  if (!txt || !window.currentServer) return;
  fbdb.ref("serverChats/" + window.currentServer).push({ user: username, text: txt });
  document.getElementById("chat-input").value = "";
}

function createServer() {
  let name = document.getElementById("new-server-name").value.trim();
  if (!name) return;
  let servers = JSON.parse(localStorage.getItem("user-servers") || `[]`);
  if (!servers.includes(name)) servers.push(name);
  localStorage.setItem("user-servers", JSON.stringify(servers));
  closeServerModal();
  loadServers();
  joinServer(name);
}
function openServerModal() { document.getElementById("create-server-modal").classList.remove("hidden"); }
function closeServerModal() { document.getElementById("create-server-modal").classList.add("hidden"); }
window.onload = () => { loadServers(); joinServer(defaultClassServer); };
  
