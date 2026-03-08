// Firebase Configuration – ITA22 8/3
// Project: lop-dia

const firebaseConfig = {
    apiKey: "AIzaSyA_kJIdPdvlM9nxBbAwpumgiLcRuchSdoo",
    authDomain: "lop-dia.firebaseapp.com",
    projectId: "lop-dia",
    storageBucket: "lop-dia.firebasestorage.app",
    messagingSenderId: "1045212878867",
    appId: "1:1045212878867:web:5bfe2d91802ebaa19087e6",
    measurementId: "G-36HN1MSQHC"
};

// Initialize Firebase (compat SDK – dùng được trong file HTML thường)
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();
