'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Avatar({ userid, avatarurl }) {
	const router = useRouter();
	const supabase = createClientComponentClient();
	const [avatarUrl, setAvatarUrl] = useState('');
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		async function downloadImage(path) {
			try {
				const { data, error } = await supabase.storage
					.from('avatars')
					.download(path);
				if (error) {
					throw error;
				}

				const url = URL.createObjectURL(data);
				setAvatarUrl(url);
			} catch (error) {
				console.log('Error downloading image: ', error);
			}
		}

		if (avatarurl) downloadImage(avatarurl);
	}, [avatarurl, supabase]);

	const uploadAvatar = async (event) => {
		try {
			setUploading(true);

			if (!event.target.files || event.target.files.length === 0) {
				throw new Error('You must select an image to upload.');
			}

			const file = event.target.files[0];
			const fileExt = file.name.split('.').pop();
			const filePath = `${userid}-${Math.random()}.${fileExt}`;

			let { data, error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, file);

			if (uploadError || !data) {
				throw uploadError;
			}

			const { data: profileupload, error } = await supabase
				.from('profile')
				.update({ avatar_url: data.path })
				.eq('id', userid)
				.select();
			if (error || !profileupload) {
				throw error;
			}
		} catch (error) {
			alert('Error uploading avatar!');
			console.log(error);
		} finally {
			setUploading(false);
			router.refresh();
		}
	};

	return (
		<div>
			{avatarUrl ? (
				<Image width={100} height={100} src={avatarUrl} alt="Avatar" />
			) : (
				<div>?</div>
			)}
			<div>
				<label>{uploading ? 'Uploading ...' : 'Upload'}</label>
				<input
					type="file"
					id="single"
					accept="image/*"
					onChange={uploadAvatar}
					disabled={uploading}
				/>
			</div>
		</div>
	);
}
