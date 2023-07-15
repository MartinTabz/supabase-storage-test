import Post from '@app/posts/components/post';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MUX from '@mux/mux-node';

export default async function Posts() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect('/auth');
	}

	const { data: profile, error } = await supabase
		.from('profile')
		.select('is_subscribed, admin')
		.eq('id', session.user.id)
		.single();

	if (error) {
		throw new Error(error.message);
	} else if (!profile) {
		redirect('/unauthorized');
	} else if (!profile.is_subscribed || !profile.admin) {
		redirect('/subscribe');
	}

	const { data: posts, error: posts_error } = await supabase
		.from('posts')
		.select(`*, post_file(*)`);

	if (posts_error) {
		throw new Error(posts_error.message);
	}

	for (let i = 0; i < posts.length; i++) {
		for (let n = 0; n < posts[i].post_file.length; n++) {
			const file = posts[i].post_file[n];
			if (!file.is_video) {
				const { data, error } = await supabase.storage
					.from('posts')
					.createSignedUrl(file.source, 60);

				if (error) {
					throw new Error(error.message);
				}

				if (!data || !data?.signedUrl) {
					throw new Error('Unable to retrieve signed URL');
				}

				posts[i].post_file[n].source = data.signedUrl;
			} else {
				const playbackId = posts[i].post_file[n].source;
				const token = MUX.JWT.signPlaybackId(playbackId, {
					keyId: process.env.MUX_SECRET_SIGNING_KEY_ID,
					keySecret: process.env.MUX_SECRET_BASE,
					expiration: '900',
					type: 'video',
				});
				posts[i].post_file[
					n
				].source = `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
			}
		}
	}

	return (
		<section>
			<h1>Posts</h1>
			<div>
				{posts.map((p) => (
					<Post key={p.id} post={p} />
				))}
			</div>
		</section>
	);
}
