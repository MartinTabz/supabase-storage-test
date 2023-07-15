'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import crypto from 'crypto';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const MenuBar = ({ editor }) => {
	if (!editor) {
		return null;
	}

	const setLink = useCallback(() => {
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);

		// cancelled
		if (url === null) {
			return;
		}

		// empty
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();

			return;
		}

		// update link
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}, [editor]);

	return (
		<>
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={editor.isActive('bold') ? 'is-active' : ''}
			>
				bold
			</button>
			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={editor.isActive('italic') ? 'is-active' : ''}
			>
				italic
			</button>
			<button
				onClick={setLink}
				className={editor.isActive('link') ? 'is-active' : ''}
			>
				set link
			</button>
		</>
	);
};

export default function Page() {
	const supabase = createClientComponentClient();
	const [images, setImages] = useState([]);
	const [imageFiles, setImageFiles] = useState([]);
	const editor = useEditor({
		extensions: [
			Color.configure({ types: [TextStyle.name, ListItem.name] }),
			TextStyle.configure({ types: [ListItem.name] }),
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
				},
			}),
			Link.configure({
				openOnClick: false,
			}),
		],
		content: ``,
	});

	const handlePost = async () => {
		try {
			const { data: new_post, error } = await supabase
				.from('posts')
				.insert({ description: editor.getHTML() })
				.select()
				.single();

			if (error || !new_post || !new_post.id) {
				throw new Error('Supabase was not able to create new post');
			}

			for (let i = 0; i < imageFiles.length; i++) {
				const file = imageFiles[i];
				let path;

				do {
					const fileExt = file.name.split('.').pop();
					const filePath = `${uuidv4()}-${crypto
						.randomBytes(16)
						.toString('hex')}.${fileExt}`;

					console.log(filePath);

					const { data: upload_data, error: upload_error } =
						await supabase.storage.from('posts').upload(filePath, file);

					if (upload_error && !upload_error.error === 'Duplicate') {
						throw new Error(upload_error.message);
					}

					if (upload_data.path) {
						path = upload_data.path;
					}
				} while (!path);

				const { data: uploaded_file, error } = await supabase
					.from('post_file')
					.insert({ is_video: false, source: path, post: new_post.id });

				console.log(uploaded_file);
				console.log(error);
			}
		} catch (error) {
			console.log('Error has occured: ', error);
		}
	};

	const onChangeUploadFile = async (event) => {
		try {
			if (!event.target.files || event.target.files.length === 0) {
				console.log('You must select an image to upload.');
			}
			const fileList = event.target.files;
			const imageUrls = [];

			// Iterate over the uploaded files
			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				setImageFiles((imageFiles) => [...imageFiles, file]);
				const imageUrl = URL.createObjectURL(file);
				imageUrls.push(imageUrl);
			}

			// Update the images state
			setImages((prevImages) => [...prevImages, ...imageUrls]);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<h1>Add new post</h1>
			<div>
				<div>
					{images.map((image, index) => (
						<Image
							key={index}
							src={image ?? ''}
							alt="Ahoj"
							width={300}
							height={300}
						/>
					))}
				</div>
				<input type="file" multiple onChange={onChangeUploadFile} />
			</div>
			<div>
				<MenuBar editor={editor} />
				<EditorContent editor={editor} />
			</div>
			<button onClick={handlePost}> Save Post</button>
		</div>
	);
}
