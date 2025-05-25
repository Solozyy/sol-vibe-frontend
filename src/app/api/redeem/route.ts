import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

// SOLV token mint address
const SOLV_TOKEN_MINT = new PublicKey(
  "mntPzAHFTHNTX1CmipfYbvD4ux5tJhL96gENGnSEDpG"
);

// Admin's SOLV token account
const ADMIN_TOKEN_ACCOUNT = new PublicKey(
  "9TVinKzUmQ6M3F2maLqSdxkkaWzS6Dgze4JqAfaGDTSF"
);

const ADMIN_PRIVATE_KEY = new Uint8Array([
  70, 108, 200, 66, 247, 14, 126, 64, 118, 55, 58, 26, 73, 66, 154, 35, 2, 35,
  53, 26, 50, 89, 59, 118, 70, 102, 116, 188, 113, 243, 212, 251, 13, 11, 98,
  30, 248, 131, 118, 135, 17, 1, 47, 57, 52, 173, 96, 167, 122, 5, 172, 61, 94,
  144, 143, 108, 76, 22, 177, 1, 97, 217, 195, 5,
]);

export async function POST(request: NextRequest) {
  try {
    const { userWallet, amount } = await request.json();

    if (!userWallet || !amount) {
      return NextResponse.json(
        { error: "Missing userWallet or amount" },
        { status: 400 }
      );
    }

    console.log("Processing redemption for:", userWallet, "Amount:", amount);

    // Create connection to Solana devnet
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    // Get admin keypair
    const adminKeypair = Keypair.fromSecretKey(ADMIN_PRIVATE_KEY);
    console.log("Admin public key:", adminKeypair.publicKey.toString());

    // Get user's public key
    const userPubkey = new PublicKey(userWallet);

    // Get the associated token account address for the user
    const userATA = await getAssociatedTokenAddress(
      SOLV_TOKEN_MINT,
      userPubkey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log("User ATA:", userATA.toString());

    let signatures: string[] = [];

    // Check if the user's ATA exists
    let needsATA = false;
    try {
      await getAccount(connection, userATA, "confirmed", TOKEN_2022_PROGRAM_ID);
      console.log("User ATA already exists");
    } catch (error) {
      console.log(
        "User ATA does not exist, will create in transfer transaction"
      );
      needsATA = true;
    }

    // Create a single transaction with ATA creation (if needed) and transfer
    console.log("Creating transfer transaction...");
    const transferTransaction = new Transaction();

    // Add ATA creation instruction if needed
    if (needsATA) {
      transferTransaction.add(
        createAssociatedTokenAccountInstruction(
          adminKeypair.publicKey, // payer
          userATA, // ata
          userPubkey, // owner
          SOLV_TOKEN_MINT, // mint
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
      console.log("Added ATA creation instruction");
    }

    // Add transfer instruction
    transferTransaction.add(
      createTransferInstruction(
        ADMIN_TOKEN_ACCOUNT,
        userATA,
        adminKeypair.publicKey,
        BigInt(amount * 10 ** 9),
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    console.log("Added transfer instruction");

    const { blockhash } = await connection.getLatestBlockhash();
    transferTransaction.recentBlockhash = blockhash;
    transferTransaction.feePayer = adminKeypair.publicKey;

    try {
      const signature = await connection.sendTransaction(
        transferTransaction,
        [adminKeypair],
        {
          skipPreflight: true, // Skip preflight to avoid simulation issues
          preflightCommitment: "confirmed",
        }
      );

      await connection.confirmTransaction(signature, "confirmed");
      signatures.push(signature);
      console.log("Transaction completed successfully:", signature);

      // Verify the transfer was successful
      try {
        const userAccountInfo = await getAccount(
          connection,
          userATA,
          "confirmed",
          TOKEN_2022_PROGRAM_ID
        );
        console.log("User final balance:", userAccountInfo.amount.toString());
      } catch (error) {
        console.log(
          "Note: Could not verify final balance, but transfer was confirmed"
        );
      }

      return NextResponse.json({
        success: true,
        signature: signature,
        signatures: signatures,
        userATA: userATA.toString(),
        message: `Successfully redeemed ${amount} credits for ${amount} SOLV tokens`,
      });
    } catch (transferError) {
      console.error("Transfer failed:", transferError);
      const errorMessage =
        transferError instanceof Error
          ? transferError.message
          : JSON.stringify(transferError);
      throw new Error(`Token transfer failed: ${errorMessage}`);
    }

    // TODO: Update user credits in database
    // This would typically involve updating a database record
    console.log("TODO: Update user credits in database");
  } catch (error) {
    console.error("Redemption API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
