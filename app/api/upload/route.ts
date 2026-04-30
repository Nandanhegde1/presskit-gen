import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pressKitId = formData.get('pressKitId') as string;
    const assetType = formData.get('type') as string;

    if (!file || !pressKitId || !assetType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user owns this press kit
    const { data: pressKit } = await supabase
      .from('press_kits')
      .select('user_id')
      .eq('id', pressKitId)
      .single();

    if (!pressKit || pressKit.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${pressKitId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('press-kit-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('press-kit-assets').getPublicUrl(fileName);

    // Save asset metadata to database
    const { data: asset, error: dbError } = await supabase
      .from('press_kit_assets')
      .insert({
        press_kit_id: pressKitId,
        type: assetType,
        url: publicUrl,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ asset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('id');

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
    }

    // Get asset and verify ownership
    const { data: asset } = await supabase
      .from('press_kit_assets')
      .select('*, press_kits!inner(user_id)')
      .eq('id', assetId)
      .single();

    if (!asset || asset.press_kits.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from storage
    const filePath = asset.url.split('/').slice(-3).join('/');
    await supabase.storage.from('press-kit-assets').remove([filePath]);

    // Delete from database
    await supabase.from('press_kit_assets').delete().eq('id', assetId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
