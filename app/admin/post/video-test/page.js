'use client';

import * as UpChunk from '@mux/upchunk';
import Router from 'next/router';
import { useEffect, useRef, useState } from 'react';
import useSwr from 'swr';
import Button from './components/button';
import ErrorMessage from './components/error-message';
import Spinner from './components/spinner';

const fetcher = (url) => {
	return fetch(url).then((res) => res.json());
};

const UploadForm = () => {
	const [isUploading, setIsUploading] = useState(false);
	const [isPreparing, setIsPreparing] = useState(false);
	const [uploadId, setUploadId] = useState(null);
	const [progress, setProgress] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');
	const inputRef = useRef(null);

	const createUpload = async () => {
		try {
			return fetch('/api/upload', {
				method: 'POST',
			})
				.then((res) => res.json())
				.then(({ id, url }) => {
					setUploadId(id);
					return url;
				});
		} catch (e) {
			console.error('Error in createUpload', e);
			setErrorMessage('Error creating upload');
		}
	};

	const startUpload = () => {
		setIsUploading(true);

		const files = inputRef.current?.files;
		if (!files) {
			setErrorMessage('An unexpected issue occurred');
			return;
		}

		const upload = UpChunk.createUpload({
			endpoint: createUpload,
			file: files[0],
		});

		upload.on('error', (err) => {
			setErrorMessage(err.detail.message);
		});

		upload.on('progress', (progress) => {
			setProgress(Math.floor(progress.detail));
		});

		upload.on('success', () => {
			setIsPreparing(true);
		});
	};

	if (errorMessage) return <ErrorMessage message={errorMessage} />;

	return (
		<>
			<div className="container">
				{isPreparing && <span>Video ready na MUXu</span>}
				{isUploading ? (
					<>
						{isPreparing ? (
							<div>Preparing..</div>
						) : (
							<div>Uploading...{progress ? `${progress}%` : ''}</div>
						)}
						<Spinner />
					</>
				) : (
					<label>
						<Button type="button" onClick={() => inputRef.current?.click()}>
							Select a video file
						</Button>
						<input type="file" onChange={startUpload} ref={inputRef} />
					</label>
				)}
			</div>
			<style jsx>{`
				input {
					display: none;
				}
			`}</style>
		</>
	);
};

export default UploadForm;
