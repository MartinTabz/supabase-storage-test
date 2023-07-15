'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
	const router = useRouter();
	const supabase = createClientComponentClient();

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push('/auth');
	};
	return <button onClick={handleSignOut}>Sign Out</button>;
}
