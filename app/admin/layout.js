import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Layout({ children }) {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect('/auth');
	}

	const { data: profil, error } = await supabase
		.from('profile')
		.select('admin')
		.eq('id', session.user.id)
		.single();

	if (error || !profil || !profil?.admin) {
		redirect('/unauthorized');
	}

	return <>{children}</>;
}
