import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "./firebaseConfig";

const auth = getAuth(app);

export const getAuthToken = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    console.log("TOKEN PARA POSTMAN:", token); // 👈 Copie este valor
    return token;
    
  } catch (error) {
    console.error("Erro no login:", error.code, error.message);
    throw error;
  }
};