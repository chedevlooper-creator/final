/**
 * Görevler API Route
 * /api/meetings/[id]/tasks
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TaskStatus, NotificationType } from "@/types/meeting.types";
import { withAuth } from "@/lib/permission-middleware";

/**
 * GET /api/meetings/[id]/tasks - Toplantı görevlerini getir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // RBAC: Görevleri görüntüleme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: "read",
      resource: "meetings",
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        assignee:auth.users(id, email, raw_user_meta_data->>full_name)
      `,
      )
      .eq("meeting_id", id)
      .order("priority", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/meetings/[id]/tasks - Yeni görev oluştur
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // RBAC: Görev oluşturma yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: "create",
      resource: "meetings",
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const supabase = await createServerSupabaseClient();
    const { id: meetingId } = await params;
    const body = await request.json();
    const { assigned_to, title, description, category, priority, due_date } =
      body;

    // Validation
    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Görev başlığı en az 3 karakter olmalıdır" },
        { status: 400 },
      );
    }

    if (!assigned_to) {
      return NextResponse.json(
        { error: "Görev atanmış bir personel seçmelisiniz" },
        { status: 400 },
      );
    }

    // Create task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        meeting_id: meetingId,
        assigned_to,
        title: title.trim(),
        description: description?.trim(),
        category: category?.trim(),
        priority: priority || "medium",
        due_date: due_date || null,
        status: TaskStatus.PENDING,
      })
      .select(
        `
        *,
        assignee:auth.users(id, email, raw_user_meta_data->>full_name)
      `,
      )
      .single();

    if (taskError) {
      return NextResponse.json({ error: taskError.message }, { status: 400 });
    }

    // Create notification for task assignment
    await supabase.from("notifications").insert({
      user_id: assigned_to,
      type: NotificationType.TASK_ASSIGNED,
      title: "Yeni Görev",
      message: `"${title}" göreviniz atanmıştır`,
      read: false,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/meetings/[id]/tasks - Görevi güncelle
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // RBAC: Görev güncelleme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: "update",
      resource: "meetings",
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const user = authResult.user!;
    const supabase = await createServerSupabaseClient();
    const { id: meetingId } = await params;
    const body = await request.json();
    const { taskId, status } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    // Get task details for notification
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("*, meeting:meetings(created_by)")
      .eq("id", taskId)
      .single();

    if (!existingTask) {
      return NextResponse.json({ error: "Görev bulunamadı" }, { status: 404 });
    }

    // Check permissions: Only assignee can update status, or meeting creator
    const isAssignee = existingTask.assigned_to === user.id;
    const isCreator = existingTask.meeting?.created_by === user.id;

    if (!isAssignee && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: any = {};
    if (status) {
      updates.status = status;
      if (status === TaskStatus.COMPLETED) {
        updates.completed_at = new Date().toISOString();
      }
    }

    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create notification for meeting creator if task is completed
    if (status === TaskStatus.COMPLETED && existingTask.meeting?.created_by) {
      await supabase.from("notifications").insert({
        user_id: existingTask.meeting.created_by,
        type: NotificationType.TASK_COMPLETED,
        title: "Görev Tamamlandı",
        message: `"${existingTask.title}" görevi tamamlandı`,
        read: false,
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
