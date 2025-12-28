/**
 * Featured Members Service
 * Manages featured team members in Firebase
 */

import { db } from '../Firebase/Firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

const FEATURED_MEMBERS_COLLECTION = 'featuredMembers';

/**
 * Get the featured members list (returns array of member IDs)
 */
export const getFeaturedMembers = async () => {
  try {
    const docRef = doc(db, FEATURED_MEMBERS_COLLECTION, 'active');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().memberIds || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured members:', error);
    throw error;
  }
};

/**
 * Update featured members list with new order
 * @param {Array} members - Array of member objects with id property
 */
export const updateFeaturedMembers = async (members) => {
  try {
    const docRef = doc(db, FEATURED_MEMBERS_COLLECTION, 'active');

    await setDoc(
      docRef,
      {
        memberIds: members.map(member => member.id),
        updatedAt: new Date(),
      },
      { merge: false }
    );
  } catch (error) {
    console.error('Error updating featured members:', error);
    throw error;
  }
};

/**
 * Add a member to featured list
 */
export const addFeaturedMember = async (memberId) => {
  try {
    const docRef = doc(db, FEATURED_MEMBERS_COLLECTION, 'active');
    const docSnap = await getDoc(docRef);
    const currentIds = docSnap.exists() ? docSnap.data().memberIds || [] : [];

    if (!currentIds.includes(memberId)) {
      await updateDoc(docRef, {
        memberIds: arrayUnion(memberId),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error adding featured member:', error);
    throw error;
  }
};

/**
 * Remove a member from featured list
 */
export const removeFeaturedMember = async (memberId) => {
  try {
    const docRef = doc(db, FEATURED_MEMBERS_COLLECTION, 'active');

    await updateDoc(docRef, {
      memberIds: arrayRemove(memberId),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error removing featured member:', error);
    throw error;
  }
};

/**
 * Clear all featured members
 */
export const clearFeaturedMembers = async () => {
  try {
    const docRef = doc(db, FEATURED_MEMBERS_COLLECTION, 'active');
    await setDoc(
      docRef,
      {
        memberIds: [],
        updatedAt: new Date(),
      },
      { merge: false }
    );
  } catch (error) {
    console.error('Error clearing featured members:', error);
    throw error;
  }
};

/**
 * Get researchers from the researchers collection
 */
export const getAllResearchers = async () => {
  try {
    const q = query(collection(db, 'researchers'));
    const querySnapshot = await getDocs(q);

    const researchers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter only current members (isFormer == false)
    return researchers
    // .filter(member => !member.isFormer);
  } catch (error) {
    console.error('Error fetching researchers:', error);
    throw error;
  }
};
