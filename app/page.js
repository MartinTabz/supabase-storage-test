import Avatar from '@components/avatar';
import LogoutButton from '@components/logoutbutton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function Home() {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();
	console.log(session);
	if (!session) {
		redirect('/auth');
	}

	const { data: user_data, error } = await supabase
		.from('profile')
		.select('*')
		.eq('id', session.user.id)
		.single();
	if (error || !user_data) {
		throw new Error('Something went wrong while trying to fetch user data.');
	}

	const { data: public_avatar } = await supabase.storage
		.from('avatars')
		.getPublicUrl(`${user_data.avatar_url}`);
	console.log(public_avatar);

	return (
		<main>
			{public_avatar && (
				<Image
					width={100}
					height={100}
					src={public_avatar.publicUrl}
					alt="Avatar"
				/>
			)}
			<h1>Hello</h1>
			<p>
				You are signed as <b>{session.user.email}</b>
			</p>
			<LogoutButton />
			<Avatar userid={session.user.id} avatarurl={user_data.avatar_url ?? ''} />
			
			
		</main>
	);
}
