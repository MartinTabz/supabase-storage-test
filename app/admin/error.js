'use client';

export default function Error({ reset, error }) {
	return (
		<div>
			<h1>Something went wrong</h1>
			<span>{error.message}</span>
			<button onClick={reset}>Try Again</button>
		</div>
	);
}
