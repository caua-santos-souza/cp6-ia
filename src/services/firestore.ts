import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { CupomFiscal } from '../types/Cupom';

const CUPONS_COLLECTION = 'cupons';

export const saveCupom = async (cupom: Omit<CupomFiscal, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CUPONS_COLLECTION), {
      ...cupom,
      createdAt: Timestamp.fromDate(cupom.createdAt),
      updatedAt: cupom.updatedAt ? Timestamp.fromDate(cupom.updatedAt) : null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar cupom:', error);
    throw error;
  }
};

export const getCupons = async (): Promise<CupomFiscal[]> => {
  try {
    const q = query(collection(db, CUPONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined,
      } as CupomFiscal;
    });
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    throw error;
  }
};

