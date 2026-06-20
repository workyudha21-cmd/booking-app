import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Password lama dan password baru harus diisi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password baru minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Use better-auth's changePassword endpoint
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: request.headers,
    });

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error: unknown) {
    console.error("Change password error:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Gagal mengubah password";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
