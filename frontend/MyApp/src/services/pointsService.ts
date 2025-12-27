// src/services/pointsService.ts

import { runTransaction, doc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

// We import the interface so we can pass the whole object
import { RewardItem } from "../data/rewardsData"; 

export interface PointTransactionResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

export const redeemRewardTransaction = async (
  userId: string,
  userName: string, 
  reward: RewardItem // <--- CHANGE: Pass the full reward object
): Promise<PointTransactionResult> => {
  
  if (!userId) return { success: false, error: "User ID is required." };

  const userRef = doc(db, "users", userId);
  // Create a new document reference in the global history collection
  const purchaseHistoryRef = doc(collection(db, "purchase_history")); 

  try {
    await runTransaction(db, async (transaction) => {
      // --- 1. READ OPERATIONS ---
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "User does not exist!";
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      const cost = reward.points;

      // Check balance
      if (currentPoints < cost) {
        throw `Insufficient points. You need ${cost} but have ${currentPoints}.`;
      }

      // --- 2. CALCULATION ---
      const newPoints = currentPoints - cost;
      const currentRedeemed = Number(userData.rewardsRedeemed) || 0;
      const newRedeemedCount = currentRedeemed + cost; // Tracking total value redeemed

      // --- 3. WRITE OPERATIONS ---
      
      // A. Update User Balance
      transaction.update(userRef, {
        points: newPoints,
        rewardsRedeemed: newRedeemedCount,
      });

      // B. Create the Purchase Record
      // We save extra fields (image, category) so the History screen looks good later
      transaction.set(purchaseHistoryRef, {
        userId: userId,
        userName: userName,      
        rewardId: reward.id,           // Save ID to link back if needed
        productName: reward.title,     // The display title
        category: reward.category,     // Helpful for analytics (e.g., "User likes Food")
        imageUrl: reward.image,        // <--- CRITICAL: Save this to show the image in history!
        pointsPaid: cost,
        status: "PENDING_DELIVERY",    // Mark as pending initially
        purchaseDate: new Date().toISOString(), // ISO string is fine and easy to read
        serverTimestamp: serverTimestamp()      // Good for sorting strictly by time
      });
    });

    return { success: true };

  } catch (e: any) {
    console.error("Redemption Transaction Failed:", e);
    // Return a clean error message
    return { success: false, error: typeof e === "string" ? e : "Transaction failed. Please check your connection." };
  }
};