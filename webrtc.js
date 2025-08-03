// webrtc.js
// === Shadow Coder - Modern WeRTC Call Logic ===

// -- Main Call State --
let rtcLocalStream = null;
let rtcRemoteStream = null;
let rtcConnection = null;
let rtcCallActive = false;

// Uses public Google STUN server:
const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// UI Modal for fullscreen
function showCallModal() {
  // Remove any existing
  document.getElementById('sc-webrtc-modal')?.remove();

  const html = `
    <div id="sc-webrtc-modal" class="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50">
      <div class="relative flex flex-col gap-2 items-center w-full h-full max-w-lg mx-auto my-auto p-3">
        <video id="sc-remote-video" autoplay playsinline class="rounded-xl w-full max-h-[40vh] bg-black mb-1 shadow-xl"></video>
        <video id="sc-local-video" muted autoplay playsinline class="rounded w-24 h-24 object-cover fixed right-6 bottom-16 bg-gray-800 border border-white" style="z-index:59"></video>
        
        <div class="flex gap-4 mt-6">
          <button id="sc-btn-endcall" class="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-xl">⛔</button>
          <button id="sc-btn-screenshare" class="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-xl" title="Screen Share">🖥️</button>
          <button id="sc-btn-games" class="bg-purple-700 hover:bg-purple-800 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-xl" title="Games">🎮</button>
        </div>
        <button id="sc-btn-minimize" class="absolute top-2 right-3 bg-gray-700 hover:bg-gray-900 text-xl text-white rounded px-3 py-1">⬇️</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  // Button handlers
  document.getElementById('sc-btn-endcall').onclick = endWebRTCCall;
  document.getElementById('sc-btn-minimize').onclick = minimizeCallModal;
  // Placeholder buttons for screen-share/games:
  document.getElementById('sc-btn-screenshare').onclick = startScreenShare;
  document.getElementById('sc-btn-games').onclick = openGamesPanel;
}

// ---- Video Call Core Flow ----

function startWebRTCCall(signalingSendFunc, signalingOnMsgFunc) {
  if (rtcCallActive) return;

  rtcConnection = new RTCPeerConnection(rtcConfig);
  rtcCallActive = true;

  showCallModal();

  // Get camera/audio
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      rtcLocalStream = stream;

      // Add local tracks to peer
      stream.getTracks().forEach(track => rtcConnection.addTrack(track, stream));

      // Local video preview
      document.getElementById('sc-local-video').srcObject = stream;
    }).catch(e => {
      alert("Camera/mic permission denied.");
      endWebRTCCall();
      return;
    });

  rtcConnection.ontrack = event => {
    if (!event.streams || !event.streams[0]) return;
    document.getElementById('sc-remote-video').srcObject = event.streams[0];
    rtcRemoteStream = event.streams[0];
  };

  rtcConnection.onicecandidate = event => {
    if (event.candidate) {
      signalingSendFunc({ type: "candidate", cand: event.candidate });
    }
  };

  // Set up signaling handler for answer/candidate/etc.
  signalingOnMsgFunc((msg) => {
    if (msg.type === "offer") {
      rtcConnection.setRemoteDescription(new RTCSessionDescription(msg.offer));
      // Got offer, make answer
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        if (!rtcLocalStream) rtcLocalStream = stream;
        rtcLocalStream.getTracks().forEach(track => rtcConnection.addTrack(track, rtcLocalStream));
        rtcConnection.createAnswer().then(answer => {
          rtcConnection.setLocalDescription(answer);
          signalingSendFunc({ type: "answer", answer: answer });
        });
      });
    }
    else if (msg.type === "answer") {
      rtcConnection.setRemoteDescription(new RTCSessionDescription(msg.answer));
    }
    else if (msg.type === "candidate") {
      rtcConnection.addIceCandidate(msg.cand);
    }
  });

  // Offer
  rtcConnection.createOffer().then(offer => {
    rtcConnection.setLocalDescription(offer);
    signalingSendFunc({ type: "offer", offer: offer });
  });
}

function endWebRTCCall() {
  rtcCallActive = false;
  try {
    document.getElementById('sc-webrtc-modal')?.remove();
  } catch (e) { }
  if (rtcConnection) rtcConnection.close();
  rtcConnection = null;
  if (rtcLocalStream) {
    rtcLocalStream.getTracks().forEach(tr => tr.stop());
    rtcLocalStream = null;
  }
  if (rtcRemoteStream) rtcRemoteStream = null;
}

function minimizeCallModal() {
  document.getElementById('sc-webrtc-modal').style.display = "none";
  // You should provide a button or indicator for user to restore modal
}

function restoreCallModal() {
  document.getElementById('sc-webrtc-modal').style.display = "";
}

// --- Screen Sharing Placeholder ---
function startScreenShare() {
  if (!rtcConnection) return;
  navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(screenStream => {
    const screenTrack = screenStream.getVideoTracks()[0];
    const senders = rtcConnection.getSenders();
    const sender = senders.find(s => s.track && s.track.kind === 'video');
    if (sender) sender.replaceTrack(screenTrack);
    screenTrack.onended = () => {
      if (rtcLocalStream) {
        let track = rtcLocalStream.getVideoTracks()[0];
        if (sender && track) sender.replaceTrack(track);
      }
    };
  });
}

// --- Games Button Placeholder ---
function openGamesPanel() {
  alert("Coming soon: Collaborative games and coding challenges!");
}

// ---- Utility ----
function isCallActive() {
  return rtcCallActive;
}

// Example: Minimized icon to bring back call window:
const callFloatIcon = document.createElement("button");
callFloatIcon.id = "sc-webrtc-float";
callFloatIcon.textContent = "🔴 Call";
callFloatIcon.className = "fixed right-2 bottom-2 bg-red-600 text-white rounded-full p-2 z-40 shadow-lg";
callFloatIcon.style.display = "none";
callFloatIcon.onclick = restoreCallModal;
document.body.appendChild(callFloatIcon);

function showFloatCallIcon(show=true) {
  document.getElementById("sc-webrtc-float").style.display = show ? "" : "none";
}

window.addEventListener('DOMContentLoaded', () => {
  // When modal minimized, show float icon; when call ends, hide
  document.body.addEventListener('click', function (e) {
    if (e.target.id === 'sc-btn-minimize') showFloatCallIcon(true);
    if (e.target.id === 'sc-btn-endcall') showFloatCallIcon(false);
  });
});

