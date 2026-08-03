// auth/auth.js
// Solo exporta la configuración. La inicialización de Firebase
// (initializeApp, getAuth, getFirestore) vive en composables/useFirebase.ts
// para evitar inicializar la app dos veces y para que funcione bien con SSR.

export const firebaseConfig = {
  apiKey: "AIzaSyAa3fvWcrLSQds72Kd9pLf18p5ekJOlsgo",
  authDomain: "proyectowebmundial-eade6.firebaseapp.com",
  projectId: "proyectowebmundial-eade6",
  storageBucket: "proyectowebmundial-eade6.firebasestorage.app",
  messagingSenderId: "1043997936581",
  appId: "1:1043997936581:web:571354aaabd5811444d9ac",
  measurementId: "G-82WS3H5PLR"
}

export default firebaseConfig;