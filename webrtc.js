let rtcLocal = null, rtcRemote = null, rtcConn = null, rtcActive = false;
const iceServers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
function showCallModal() {
  document.getElementById("sc-webrtc-modal")?.remove();
  const html = `
    <div id="sc-webrtc-modal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div class="flex flex-col items-center w-full max-w-xl bg-gray-900 rounded-xl shadow p-2">
        <video id="sc-remote-video" autoplay playsinline class="rounded-lg w-full max-h-[40vh] bg-black my-2 shadow"></video>
        <video id="sc-local-video" muted autoplay playsinline class="rounded w-24 h-24 object-cover fixed right-10 bottom-20 bg-gray-800 border border-white" style="z-index:59"></video>
        <div class="flex gap-4 mt-4">
          <button id="sc-btn-endcall" class="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-xl">⛔</button>
          <button id="sc-btn-screenshare" class="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-xl" title="Screen Share">🖥️</button>
          <button id="sc-btn-games" class="bg-purple-800 hover:bg-purple-900 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-xl" title="Games">🎮</button>
        </div>
        <button id="sc-btn-minimize" class="absolute top-2 right-3 bg-gray-700 hover:bg-gray-900 text-xl text-white rounded px-3 py-1">⬇️</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById("sc-btn-endcall").onclick = endWebRTCCall;
  document.getElementById("sc-btn-minimize").onclick = minimizeCallModal;
  document.getElementById("sc-btn-screenshare").onclick = startScreenShare;
  document.getElementById("sc-btn-games").onclick = openGamesPanel;
}
function initiateCall() {
  if (rtcActive) return;
  rtcConn = new RTCPeerConnection(iceServers);
  rtcActive = true; showCallModal();
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      rtcLocal = stream;
      stream.getTracks().forEach(t => rtcConn.addTrack(t, stream));
      document.getElementById("sc-local-video").srcObject = stream;
    }).catch(() => { alert("Camera permission denied"); endWebRTCCall(); });
  rtcConn.ontrack = e => {
    if (!e.streams[0]) return;
    document.getElementById("sc-remote-video").srcObject = e.streams[0]; rtcRemote = e.streams[0];
  };
  // Add your signaling logic here (ex: via Firebase)
  // This is a placeholder for signaling connect (offer/answer/candidate exchange)
}
function endWebRTCCall() {
  rtcActive = false;
  document.getElementById("sc-webrtc-modal")?.remove();
  if (rtcConn) { rtcConn.close(); rtcConn = null; }
  if (rtcLocal) { rtcLocal.getTracks().forEach(t => t.stop()); rtcLocal = null; }
  rtcRemote = null;
}
function minimizeCallModal() { document.getElementById("sc-webrtc-modal").style.display = "none"; }
function startScreenShare() { /* Add getDisplayMedia logic for sharing */ alert("Screen sharing coming soon!"); }
function openGamesPanel() { alert("Games panel coming soon!"); }
