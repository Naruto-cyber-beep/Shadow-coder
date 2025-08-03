let username = localStorage.getItem("sc-username") || prompt("Enter your name:");
localStorage.setItem("sc-username", username);

let userClass = localStorage.getItem("sc-class");
if (!userClass) {
  userClass = prompt("Enter your class (e.g., 8, 9, 10):");
  localStorage.setItem("sc-class", userClass);
}
const defaultClassServer = `Class ${userClass} Server`;

function loadServers() {
  const container = document.getElementById("server-list");
  container.innerHTML = "";
  const servers = JSON.parse(localStorage.getItem("user-servers") || `["${defaultClassServer}"]`);
  for (let name of servers) {
    const btn = document.createElement("button");
    btn.className = "w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-600 text-lg font-bold";
    btn.textContent = name[0];
    btn.title = name;
    btn.onclick = () => joinServer(name);
    container.appendChild(btn);
  }
}
function joinServer(name) {
  currentServer = name;
  document.getElementById("server-name").textContent = name;
  const area = document.getElementById("chat-area");
  area.innerHTML = "";

  const chatRef = fb.ref("serverChats/" + name);
  chatRef.off();
  chatRef.on("child_added", snap => {
    const m = snap.val();
    const div = document.createElement("div");
    div.innerHTML = `<b>${m.user}</b>: ${m.text}`;
    area.appendChild(div);
    area.scrollTo({ top: area.scrollHeight });
  });
}
function sendMessage() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg || !currentServer) return;
  fb.ref("serverChats/" + currentServer).push({ user: username, text: msg });
  input.value = "";
}
function openCreateModal() {
  document.getElementById("create-modal").classList.remove("hidden");
}
function closeCreateModal() {
  document.getElementById("create-modal").classList.add("hidden");
}
function createServer() {
  const name = document.getElementById("new-server-name").value.trim();
  if (!name) return;
  let servers = JSON.parse(localStorage.getItem("user-servers") || `[]`);
  if (!servers.includes(name)) servers.push(name);
  localStorage.setItem("user-servers", JSON.stringify(servers));
  closeCreateModal();
  loadServers();
  joinServer(name);
}
window.onload = () => {
  loadServers();
  joinServer(defaultClassServer);
};
                                                      
