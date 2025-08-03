// js/firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyAOHLoX1OGHiznYvYeUSkrR2lAxzhVrsGw",
  authDomain: "learn-code-with-anay.firebaseapp.com",
  databaseURL: "https://learn-code-with-anay-default-rtdb.firebaseio.com",
  projectId: "learn-code-with-anay",
  storageBucket: "learn-code-with-anay.appspot.com",
  messagingSenderId: "197075143711",
  appId: "1:197075143711:web:64fc5d83528f907d38d92a"
};
firebase.initializeApp(firebaseConfig);
window.db = firebase.database();
