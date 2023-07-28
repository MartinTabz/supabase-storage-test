import Mux from '@mux/mux-node';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

const { Video } = new Mux(process.env.MUX_ACCESS_TOKEN, process.env.MUX_SECRET);

export async function POST(req) {
	const supabase = createRouteHandlerClient({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return NextResponse.json(
			{
				id: null,
				url: null,
				error: 'You are not allowed to call this API',
			},
			{ status: 401 }
		);
	}

	const { data: profile, error } = await supabase
		.from('profile')
		.select('admin')
		.eq('id', session.user.id)
		.single();

	if (error) {
		return NextResponse.json(
			{
				id: null,
				url: null,
				error: 'You are not allowed to call this API',
			},
			{ status: 400 }
		);
	}

	if (!profile.admin) {
		return NextResponse.json(
			{
				id: null,
				url: null,
				error: 'You are not allowed to call this API',
			},
			{ status: 401 }
		);
	}

	try {
		const upload = await Video.Uploads.create({
			new_asset_settings: { playback_policy: 'signed' },
			cors_origin: '*',
		});
		console.log({ upload });


		return NextResponse.json({
			id: upload.id,
			url: upload.url,
			error: null,
		});
	} catch (e) {
		console.error('Request error', e);
		return NextResponse.json(
			{
				id: null,
				url: null,
				error: e,
			},
			{ status: 500 }
		);
	}
}
