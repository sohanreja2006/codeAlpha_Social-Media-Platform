const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️  Database already contains users. Skipping initial seed.');
      return;
    }

    console.log('🌱 Seeding initial demo data for SOCIALY...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // 1. Create demo users
    const users = await User.create([
      {
        fullName: 'Elena Rostova',
        username: 'elena_ui',
        email: 'elena@socialy.io',
        password,
        bio: 'Senior Product Designer & Creative Director ✨ Designing the future of spatial and glassmorphic interfaces.',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      },
      {
        fullName: 'Marcus Vance',
        username: 'marcus_v',
        email: 'marcus@socialy.io',
        password,
        bio: 'Full-stack Architect & WebGL enthusiast 🚀 Building performant real-time systems with Node and React.',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
      },
      {
        fullName: 'Sophia Chen',
        username: 'sophiacodes',
        email: 'sophia@socialy.io',
        password,
        bio: 'AI researcher & minimalist photographer 📸 Exploring human-computer aesthetics.',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80',
      },
      {
        fullName: 'Julian Hayes',
        username: 'julian_dev',
        email: 'julian@socialy.io',
        password,
        bio: 'Design engineer @ Socialy 💜 Passionate about micro-interactions and smooth 60fps animations.',
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      },
    ]);

    const [elena, marcus, sophia, julian] = users;

    // Set up mutual follow relationships
    elena.following.push(marcus._id, sophia._id);
    elena.followers.push(marcus._id, julian._id);
    await elena.save();

    marcus.following.push(elena._id, julian._id);
    marcus.followers.push(elena._id, sophia._id);
    await marcus.save();

    sophia.following.push(elena._id, marcus._id);
    sophia.followers.push(elena._id);
    await sophia.save();

    julian.following.push(elena._id);
    julian.followers.push(marcus._id);
    await julian.save();

    // 2. Create sample posts
    const post1 = await Post.create({
      author: elena._id,
      content: 'Just launched the new glassmorphic design token system for SOCIALY! 🎨 The subtle balance between frosted glass opacity, ambient depth, and soft lavender gradients creates pure visual harmony. What do you think of this aesthetic?',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      likes: [marcus._id, sophia._id, julian._id],
    });

    const post2 = await Post.create({
      author: marcus._id,
      content: 'Clean code is like good typography: when it is done right, nobody notices the effort, but everyone feels the seamless experience. 💻 Excited to see the response times under 40ms across our micro-endpoints.',
      image: '',
      likes: [elena._id, julian._id],
    });

    const post3 = await Post.create({
      author: sophia._id,
      content: 'Morning study session on multi-modal interaction design. ☕ The convergence between natural language models and tactile UI components will completely redefine how we browse social feeds.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80',
      likes: [elena._id, marcus._id],
    });

    const post4 = await Post.create({
      author: julian._id,
      content: 'Pro tip: Always use CSS custom properties for your elevation tiers and backdrop blurs. It makes switching themes and maintaining consistency across responsive layouts effortless! ⚡️',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      likes: [elena._id],
    });

    // 3. Create comments
    const comment1 = await Comment.create({
      post: post1._id,
      author: marcus._id,
      content: 'The depth on those frosted glass cards is gorgeous Elena! 👏 Super readable too.',
    });

    const comment2 = await Comment.create({
      post: post1._id,
      author: sophia._id,
      content: 'Obsessed with that violet tint. Giving real next-generation vibes!',
    });

    post1.comments.push(comment1._id, comment2._id);
    await post1.save();

    const comment3 = await Comment.create({
      post: post3._id,
      author: elena._id,
      content: '100% agree Sophia! The tactile feedback makes all the difference.',
    });

    post3.comments.push(comment3._id);
    await post3.save();

    console.log('✅ Demo data seeded successfully!');
    console.log('Demo accounts password: password123');
    console.log('Demo accounts emails: elena@socialy.io, marcus@socialy.io, sophia@socialy.io, julian@socialy.io');
  } catch (error) {
    console.error('Seed error:', error);
  }
};

module.exports = seedData;

