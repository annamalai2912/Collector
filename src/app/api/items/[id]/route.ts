import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getDiskItems, saveDiskItems } from '@/lib/storage/diskStore';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    // Update Disk Store
    const currentDiskItems = getDiskItems();
    const updatedDiskItems = currentDiskItems.map((item) =>
      item.id === id ? { ...item, ...body, updated_at: new Date().toISOString() } : item
    );
    saveDiskItems(updatedDiskItems);

    // Update Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('items')
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.error('Failed to update Supabase:', e);
      }
    }

    return NextResponse.json({ success: true, updatedId: id, changes: body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    // Delete from Disk Store
    const currentDiskItems = getDiskItems();
    const filteredDiskItems = currentDiskItems.filter((item) => item.id !== id);
    saveDiskItems(filteredDiskItems);

    // Delete from Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').delete().eq('id', id);
      } catch (e) {
        console.error('Failed to delete from Supabase:', e);
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete item' }, { status: 500 });
  }
}
