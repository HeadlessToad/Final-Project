// src/services/pointsService.ts

import { runTransaction, doc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

export interface PointTransactionResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

export const redeemRewardTransaction = async (
  userId: string,
  userName: string, 
  cost: number,
  rewardTitle: string
): Promise<PointTransactionResult> => {
  if (!userId) return { success: false, error: "User ID is required." };

  const userRef = doc(db, "users", userId);
  const purchaseHistoryRef = doc(collection(db, "purchase_history")); 

  try {
    await runTransaction(db, async (transaction) => {
      // --- READ OPERATIONS ---
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "User does not exist!";
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;

      if (currentPoints < cost) {
        throw "Insufficient points to redeem this reward.";
      }

      // --- WRITE OPERATIONS ---
      const newPoints = currentPoints - cost;
      const currentRedeemed = Number(userData.rewardsRedeemed) || 0;
      const newRedeemedCount = currentRedeemed + cost;

      // A. Update User Balance
      transaction.update(userRef, {
        points: newPoints,
        rewardsRedeemed: newRedeemedCount,
      });

      // B. Add to purchase_history
      transaction.set(purchaseHistoryRef, {
        userId: userId,
        userName: userName,      
        productName: rewardTitle,
        pointsPaid: cost,
        purchaseDate: new Date().toISOString()
      });
    });

    return { success: true };
  } catch (e: any) {
    console.error("Redemption Transaction Failed:", e);
    return { success: false, error: typeof e === "string" ? e : "Transaction failed." };
  }
};