import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  DocumentData,
  WhereFilterOp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBx47SCHxsxnP0ZFlAvtmIvxCcCvFu--ds",
  authDomain: "samira-travel.firebaseapp.com",
  databaseURL: "https://samira-travel-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "samira-travel",
  storageBucket: "samira-travel.appspot.com",
  messagingSenderId: "891625530636",
  appId: "1:891625530636:web:7f68c0f2954c1b34fd5529",
  measurementId: "G-H0B23JQXNS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    throw error;
  }
};

export const getDocuments = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T)
    );
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};

export const getDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    console.error('Error getting document: ', error);
    throw error;
  }
};

export const queryDocuments = async <T>(
  collectionName: string,
  field: string,
  operator: WhereFilterOp,
  value: string
): Promise<T[]> => {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T)
    );
  } catch (error) {
    console.error('Error querying documents: ', error);
    throw error;
  }
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file: ', error);
    throw error;
  }
};

export { app, db, storage };
