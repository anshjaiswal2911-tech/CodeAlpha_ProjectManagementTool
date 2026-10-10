const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const users = await User.create([
      {
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'password123',
        jobTitle: 'Lead Product Manager',
        bio: 'Passionate about building scalable web applications and agile development.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password: 'password123',
        jobTitle: 'Senior Full Stack Engineer',
        bio: 'React, Node.js, and Cloud systems enthusiast.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'David Miller',
        email: 'david@example.com',
        password: 'password123',
        jobTitle: 'UI/UX Designer',
        bio: 'Creating intuitive user flows, design systems, and micro-interactions.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    ]);

    const [alex, sarah, david] = users;

    console.log('[Seed] Creating demo projects...');
    const project1 = await Project.create({
      title: 'NextGen Mobile Banking App',
      description: 'Complete overhaul of mobile customer experience including biometric login, real-time transfers, and portfolio tracking.',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'admin', joinedAt: new Date() },
        { user: sarah._id, role: 'member', joinedAt: new Date() },
        { user: david._id, role: 'member', joinedAt: new Date() },
      ],
      category: 'Development',
      color: '#6366f1', // Indigo
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
    });

    const project2 = await Project.create({
      title: 'AI Marketing Analytics Suite',
      description: 'Machine learning powered conversion analytics, campaign prediction models, and executive executive reporting dashboards.',
      owner: sarah._id,
      members: [
        { user: sarah._id, role: 'admin', joinedAt: new Date() },
        { user: alex._id, role: 'member', joinedAt: new Date() },
      ],
      category: 'Product',
      color: '#10b981', // Emerald
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    console.log('[Seed] Creating sample tasks...');
    const tasksP1 = await Task.create([
      {
        title: 'Design high-fidelity design system in Figma',
        description: 'Establish typography, color palettes, dark mode variants, and button states for mobile components.',
        project: project1._id,
        status: 'completed',
        priority: 'high',
        assignee: david._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        order: 0,
        tags: ['Design', 'Figma', 'UI'],
      },
      {
        title: 'Build secure biometric authentication flow',
        description: 'Integrate FaceID and Fingerprint authentication with JWT refresh tokens and encrypted keychain storage.',
        project: project1._id,
        status: 'in_progress',
        priority: 'urgent',
        assignee: sarah._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        order: 1,
        tags: ['Security', 'Auth', 'Backend'],
      },
      {
        title: 'Implement interactive transaction history filter',
        description: 'Allow users to filter transactions by date range, merchant category, amount thresholds, and export to CSV/PDF.',
        project: project1._id,
        status: 'in_review',
        priority: 'medium',
        assignee: sarah._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        order: 2,
        tags: ['Frontend', 'Features'],
      },
      {
        title: 'Setup push notification infrastructure',
        description: 'Connect APNS and Firebase Cloud Messaging for balance alerts, low funds warnings, and card security updates.',
        project: project1._id,
        status: 'todo',
        priority: 'high',
        assignee: alex._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        order: 3,
        tags: ['DevOps', 'Notifications'],
      },
      {
        title: 'Conduct user testing with 15 beta participants',
        description: 'Draft survey questions and schedule 30-minute moderated usability sessions for wireframe validation.',
        project: project1._id,
        status: 'backlog',
        priority: 'low',
        assignee: david._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        order: 4,
        tags: ['Research', 'Testing'],
      },
    ]);

    const tasksP2 = await Task.create([
      {
        title: 'Integrate OpenAI / LLM summary pipeline',
        description: 'Build prompt templates for daily campaign KPI digestion and automated anomaly detection.',
        project: project2._id,
        status: 'in_progress',
        priority: 'urgent',
        assignee: alex._id,
        reporter: sarah._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        order: 0,
        tags: ['AI', 'Data', 'Backend'],
      },
      {
        title: 'Build Chart.js / Recharts interactive dashboard',
        description: 'Render conversion funnel visualizers with responsive zooming and multi-metric comparisons.',
        project: project2._id,
        status: 'todo',
        priority: 'medium',
        assignee: sarah._id,
        reporter: sarah._id,
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        order: 1,
        tags: ['Frontend', 'Charts'],
      },
    ]);

    console.log('[Seed] Adding sample comments...');
    await Comment.create([
      {
        task: tasksP1[1]._id, // Biometric auth task
        author: alex._id,
        content: 'Sarah, make sure we handle fallbacks gracefully when biometrics fail 3 consecutive times.',
      },
      {
        task: tasksP1[1]._id,
        author: sarah._id,
        content: 'Added passcode fallback with temporary 60-second rate limiting cooldown. Running integration tests now!',
      },
      {
        task: tasksP1[0]._id, // Figma task
        author: david._id,
        content: 'Figma component library published with full auto-layout tokens and color variables.',
      },
      {
        task: tasksP1[0]._id,
        author: alex._id,
        content: 'Looks fantastic! Approved for sprint development.',
      },
    ]);

    console.log('✅ [Seed] Database seeded successfully!');
    console.log('Demo Credentials:');
    console.log('1. Email: alex@example.com    | Password: password123 (PM / Admin)');
    console.log('2. Email: sarah@example.com   | Password: password123 (Engineer)');
    console.log('3. Email: david@example.com   | Password: password123 (Designer)');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed] Error seeding data:', err);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
