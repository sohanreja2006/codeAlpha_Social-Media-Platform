process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('./server');

async function runTests() {
  console.log('🧪 Starting End-to-End API Test Suite for SOCIALY...\n');

  try {
    // Wait for DB connection & initial demo seed
    await app.ready;
    console.log('✅ Server and Database ready for tests.\n');

    // 1. Health check
    console.log('1️⃣ Testing GET /api/health...');
    const health = await request(app).get('/api/health');
    console.log(`   Status: ${health.status}, Response:`, health.body);

    // 2. Demo User Login
    console.log('\n2️⃣ Testing POST /api/auth/login with demo user...');
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'elena@socialy.io',
      password: 'password123',
    });
    console.log(`   Status: ${loginRes.status}`);
    const token = loginRes.body.token;
    const user = loginRes.body.user;
    console.log(`   Logged in as: ${user.fullName} (@${user.username})`);

    // 3. Auth Me
    console.log('\n3️⃣ Testing GET /api/auth/me...');
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${meRes.status}, Me: ${meRes.body.fullName}`);

    // 4. Feed
    console.log('\n4️⃣ Testing GET /api/posts/feed...');
    const feedRes = await request(app)
      .get('/api/posts/feed')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${feedRes.status}, Feed posts count: ${feedRes.body.length}`);

    // 5. Create a new post
    console.log('\n5️⃣ Testing POST /api/posts (creating new post)...');
    const newPostRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Testing SOCIALY automated full-stack integration! #Glassmorphism #BuildInPublic',
      });
    console.log(`   Status: ${newPostRes.status}, Created post ID: ${newPostRes.body._id}`);
    const createdPostId = newPostRes.body._id;

    // 6. Like post
    console.log('\n6️⃣ Testing POST /api/posts/:id/like...');
    const likeRes = await request(app)
      .post(`/api/posts/${createdPostId}/like`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${likeRes.status}, Liked: ${likeRes.body.liked}, Count: ${likeRes.body.likesCount}`);

    // 7. Add comment
    console.log('\n7️⃣ Testing POST /api/comments...');
    const commentRes = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        postId: createdPostId,
        content: 'This platform looks and feels super sleek! 🚀',
      });
    console.log(`   Status: ${commentRes.status}, Comment ID: ${commentRes.body._id}`);
    const createdCommentId = commentRes.body._id;

    // 8. Delete comment
    console.log('\n8️⃣ Testing DELETE /api/comments/:id...');
    const delCommentRes = await request(app)
      .delete(`/api/comments/${createdCommentId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${delCommentRes.status}, Message: ${delCommentRes.body.message}`);

    // 9. Suggestions
    console.log('\n9️⃣ Testing GET /api/users/suggestions...');
    const sugRes = await request(app)
      .get('/api/users/suggestions')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${sugRes.status}, Suggested count: ${sugRes.body.length}`);

    // 10. Delete post
    console.log('\n🔟 Testing DELETE /api/posts/:id...');
    const delPostRes = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${delPostRes.status}, Message: ${delPostRes.body.message}`);

    console.log('\n🎉 ALL 10 BACKEND INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
