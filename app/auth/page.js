'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Auth() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter();
	const supabase = createClientComponentClient();
	const [error, setError] = useState('');

	const handleSignUp = async () => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `http://localhost:3000/auth/callback`,
			},
		});
		if (error) {
			setError(error.message);
		} else {
			router.push('/');
		}
	};

	const handleSignIn = async () => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			setError(error.message);
		} else {
			router.push('/');
		}
	};

	return (
		<>
			<section
				style={{
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					height: '100vh',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '20px',
						textAlign: 'center',
						maxWidth: '400px',
						width: '95%',
					}}
				>
					{error && <span style={{ color: 'red' }}>{error}</span>}
					<h1>Sign In/Up</h1>
					<input
						name="email"
						placeholder="E-Mail"
						onChange={(e) => {
							setEmail(e.target.value);
							if (error) {
								setError('');
							}
						}}
						value={email}
					/>
					<input
						type="password"
						name="password"
						placeholder="Password"
						onChange={(e) => {
							setPassword(e.target.value);
							if (error) {
								setError('');
							}
						}}
						value={password}
					/>
					<button onClick={handleSignIn}>Sign in</button>
					<span>or</span>
					<button onClick={handleSignUp}>Sign up</button>
				</div>
			</section>
		</>
	);
}
