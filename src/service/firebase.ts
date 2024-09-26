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
  QueryDocumentSnapshot,
  QueryConstraint,
  orderBy,
  limit,
  startAfter,
  Query,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBx47SCHxsxnP0ZFlAvtmIvxCcCvFu--ds',
  authDomain: 'samira-travel.firebaseapp.com',
  databaseURL:
    'https://samira-travel-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'samira-travel',
  storageBucket: 'samira-travel.appspot.com',
  messagingSenderId: '891625530636',
  appId: '1:891625530636:web:7f68c0f2954c1b34fd5529',
  measurementId: 'G-H0B23JQXNS',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export type QueryCondition = {
  field: string;
  operator: WhereFilterOp,
  value: any;
};

export const getPaginatedDocuments = async <T>(
  collectionName: string,
  pageSize: number,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  conditions: QueryCondition[] = [],
  orderByField: string = 'nama',
  orderDirection: 'asc' | 'desc' = 'asc'
): Promise<{
  data: T[];
  newLastVisible: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    const queryConstraints: QueryConstraint[] = [
      orderBy(orderByField, orderDirection),
      limit(pageSize),
    ];

    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }

    conditions.forEach((condition) => {
      queryConstraints.push(
        where(condition.field, condition.operator, condition.value)
      );
    });

    const querySnapshot = await getDocs(
      query(collection(db, collectionName), ...queryConstraints)
    );

    const documents = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T)
    );

    const newLastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { data: documents, newLastVisible };
  } catch (error) {
    console.error('Error getting paginated documents: ', error);
    throw error;
  }
};

export const getTotalCount = async (
  collectionName: string,
  conditions: QueryCondition[] = []
): Promise<number> => {
  try {
    let q: Query<DocumentData, DocumentData> = collection(db, collectionName);

    conditions.forEach((condition) => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting total count: ', error);
    throw error;
  }
};

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
