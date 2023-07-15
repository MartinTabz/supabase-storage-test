'use client';

export default function Error({ error, reset }) {
	return (
		<section>
			<h1>Something went wrong!</h1>
         <span>{error.message}</span>
         <pre>{JSON.stringify(error, null, 2)}</pre>
         <button onClick={reset}>Try Again</button>
		</section>
	);
}
