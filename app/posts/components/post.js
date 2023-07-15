'use client';

import MuxVideo from '@mux/mux-video-react';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Post({ post }) {
   useEffect(() => {
      console.log(post);
   }, [post]);
	return (
		<div key={post.id}>
			<div style={{ display: 'flex' }}>
				{post.post_file.map((file) => (
					<div key={file.id}>
						{file.is_video ? (
							<MuxVideo
								controls
								streamtype="on-demand"
								src={file.source}
								type="hls"
							/>
						) : (
							<Image
								src={file.source}
								alt="This is text"
								width={300}
								height={300}
							/>
						)}
					</div>
				))}
			</div>
			<div dangerouslySetInnerHTML={{ __html: post.description }} />
		</div>
	);
}
