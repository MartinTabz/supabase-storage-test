'use client';

import { DndContext, closestCenter } from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	rectSwappingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import crypto from 'crypto';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from "@styles/Styles.module.css"

export function SortableFiles({ file }) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: file.id });

	const style = {
		transform,
		transform: CSS.Transform.toString(transform),
	};

	return (
		<div style={style} ref={setNodeRef} {...attributes} {...listeners}>
			{file.video ? (
				<video controls>
					<source src={file.src} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			) : (
				<Image src={file.src ?? ''} alt="Ahoj" width={300} height={300} />
			)}
		</div>
	);
}

export default function Page() {
	const supabase = createClientComponentClient();

	const [files, setFiles] = useState([]);
	const [fileFiles, setFileFiles] = useState([]);

	const handlePost = async () => {
		console.log(files);
		console.log(fileFiles);

		for (let i = 0; i < fileFiles.length; i++) {
			const file = fileFiles[i];

			const fileExt = file.file.name.split('.').pop();
			const filePath = `${uuidv4()}-${crypto
				.randomBytes(16)
				.toString('hex')}.${fileExt}`;

			console.log('File extension: ', fileExt);
			console.log('File path: ', filePath);
		}
	};

	const onChangeUploadFile = async (event) => {
		try {
			if (!event.target.files || event.target.files.length === 0) {
				console.log('You must select an image to upload.');
			}

			const fileList = event.target.files;

			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				const fileExt = file.name.split('.').pop();
				if (
					fileExt == 'jpg' ||
					fileExt == 'png' ||
					fileExt == 'webp' ||
					fileExt == 'webm' ||
					fileExt == 'jfif' ||
					fileExt == 'pjpeg' ||
					fileExt == 'jpeg' ||
					fileExt == 'pjp'
				) {
					setFileFiles((fileFiles) => [
						...fileFiles,
						{ id: fileFiles.length + 1, video: false, file: file },
					]);
					const imageUrl = URL.createObjectURL(file);
					setFiles((files) => [
						...files,
						{ id: files.length + 1, video: false, src: imageUrl },
					]);
				}
				if (
					fileExt == 'm4v' ||
					fileExt == 'mp4' ||
					fileExt == 'avi' ||
					fileExt == 'webm'
				) {
					setFileFiles((fileFiles) => [
						...fileFiles,
						{ id: fileFiles.length + 1, video: true, file: file },
					]);
					const videoUrl = URL.createObjectURL(file);
					setFiles((files) => [
						...files,
						{ id: files.length + 1, video: true, src: videoUrl },
					]);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const onDragEnd = (event) => {
		const { active, over } = event;
		if (active.id === over.id) {
			return;
		}
		setFiles((files) => {
			const oldIndex = files.findIndex((file) => file.id === active.id);
			const newIndex = files.findIndex((file) => file.id === over.id);
			return arrayMove(files, oldIndex, newIndex);
		});
		setFileFiles((fileFiles) => {
			const oldIndex = fileFiles.findIndex(
				(fileFiles) => fileFiles.id === active.id
			);
			const newIndex = fileFiles.findIndex(
				(fileFiles) => fileFiles.id === over.id
			);
			return arrayMove(fileFiles, oldIndex, newIndex);
		});
	};

	return (
		<div>
			<h1>Add new post</h1>
			<div>
				<div>
					<DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
						<SortableContext
							items={files}
							strategy={rectSwappingStrategy}
						>
							<div className={styles.grid}>
								{files.map((file) => (
									<SortableFiles key={file.id} file={file} />
								))}
							</div>
						</SortableContext>
					</DndContext>
				</div>
				<input
					type="file"
					accept="video/mp4,video/avi,video/mkv,video/webm,video/mov,image/png,image/webp,image/jpeg"
					multiple
					onChange={onChangeUploadFile}
				/>
			</div>
			<button onClick={handlePost}> Save Post</button>
		</div>
	);
}
