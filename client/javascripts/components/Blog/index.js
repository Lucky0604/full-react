import React from 'react';

import AddPostForm from '../../container/PostForm';
import PostList from '../../container/PostList';

function Blog(props) {
  return (
    <div className="blog-list">
      <h1>Blog</h1>
      <AddPostForm />
      <PostList />
    </div>
  );
}

export default Blog;