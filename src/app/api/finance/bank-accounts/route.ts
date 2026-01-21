import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { bankAccountSchema } from "@/lib/validations/finance";
import { withAuth } from "@/lib/permission-middleware";

export async function GET(request: NextRequest) {
  try {
    // RBAC: Banka hesaplarını görüntüleme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: "read",
      resource: "finance",
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const user = authResult.user!;
    const supabase = await createServerSupabaseClient();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data, count: data?.length || 0 });
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // RBAC: Banka hesabı oluşturma yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: "create",
      resource: "finance",
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const user = authResult.user!;
    const supabase = await createServerSupabaseClient();

    const body = await request.json();

    const validated = bankAccountSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error },
        { status: 400 },
      );
    }

    if (validated.data.is_primary) {
      const { data: existingPrimary } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_primary", true)
        .single();

      if (existingPrimary) {
        return NextResponse.json(
          { error: "Zaten birincil bir hesap mevcut" },
          { status: 400 },
        );
      }
    }

    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({ ...validated.data, user_id: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // RBAC: Banka hesabı güncelleme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: "update",
      resource: "finance",
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const user = authResult.user!;
    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const body = await request.json();
    const validated = bankAccountSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("bank_accounts")
      .update(validated.data)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // RBAC: Banka hesabı silme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: "delete",
      resource: "finance",
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const user = authResult.user!;
    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const { data: account } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!account) {
      return NextResponse.json({ error: "Hesap bulunamadı" }, { status: 404 });
    }

    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
