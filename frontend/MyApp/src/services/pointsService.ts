// src/services/pointsService.ts
// ============================================================================
// SERVICE PURPOSE:
// Manages the financial/gamification logic of the app. 
// Uses Firebase Firestore Transactions to ensure atomic reads and writes.
// This prevents "Race Conditions" (e.g., a user double-tapping 'Redeem' 
// to buy two items when they only have points for one) by locking the 
// database documents during the operation.
// ============================================================================

import { runTransaction, doc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

// We import the interface so we can pass the whole object
import { RewardItem } from "../data/rewardsData"; 

// Defines the standard response format for our transaction service
export interface PointTransactionResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

// Main function to process a reward redemption
export const redeemRewardTransaction = async (
  userId: string,
  userName: string, 
  reward: RewardItem // Pass the full reward object to extract all necessary metadata
): Promise<PointTransactionResult> => {
  
  // Fail-safe: Ensure we have a user before attempting database operations
  if (!userId) return { success: false, error: "User ID is required." };

  const userRef = doc(db, "users", userId);
  // Create a new document reference in the global history collection
  const purchaseHistoryRef = doc(collection(db, "purchase_history")); 

  try {
    // Initiate the Firestore Transaction
    await runTransaction(db, async (transaction) => {
      
      // --- 1. READ OPERATIONS ---
      // In Firestore transactions, ALL reads must happen before ANY writes.
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "User does not exist!"; // Triggers the catch block below
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      const cost = reward.points;

      // Check balance: Ensure the user can actually afford this item
      if (currentPoints < cost) {
        throw `Insufficient points. You need ${cost} but have ${currentPoints}.`;
      }

      // --- 2. CALCULATION ---
      const newPoints = currentPoints - cost;
      const currentRedeemed = Number(userData.rewardsRedeemed) || 0;
      
      // Tracking total value redeemed (Lifetime gamification stats)
      const newRedeemedCount = currentRedeemed + cost; 

      // --- 3. WRITE OPERATIONS ---
      
      // A. Update User Balance & Stats
      transaction.update(userRef, {
        points: newPoints,
        rewardsRedeemed: newRedeemedCount,
      });

      // B. Create the Purchase Record
      // We save extra fields (image, category) so the PointsHistory screen 
      // can render a rich UI without needing to join collections.
      transaction.set(purchaseHistoryRef, {
        userId: userId,
        userName: userName,      
        rewardId: reward.id,           // Save ID to link back if needed
        productName: reward.title,     // The display title
        category: reward.category,     // Helpful for analytics (e.g., "User likes Food")
        imageUrl: reward.image,        // CRITICAL: Save this to show the image in history!
        pointsPaid: cost,
        status: "PENDING_DELIVERY",    // Mark as pending initially (Admin can change to DELIVERED)
        purchaseDate: new Date().toISOString(), // ISO string is fine and easy to read/parse
        serverTimestamp: serverTimestamp()      // Good for sorting strictly by database time
      });
    });

    // If the transaction completes without throwing an error, it was successful
    return { success: true };

  } catch (e: any) {
    console.error("Redemption Transaction Failed:", e);
    // Return a clean error message back to the UI (RewardDetailsScreen)
    // If 'e' is a string, it's our custom thrown error (e.g., "Insufficient points").
    return { success: false, error: typeof e === "string" ? e : "Transaction failed. Please check your connection." };
  }
};