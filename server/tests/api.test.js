const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../src/config/db');
const { app } = require('../src/server');

let server;
let baseUrl;

const request = async (method, path, body = null, token = null) => {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🚀 RUNNING COMPREHENSIVE BACKEND API TEST SUITE');
  console.log('======================================================\n');

  await connectDB();
  server = app.listen(0); // Random open port
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    console.log('--- Phase 1: API Health Check ---');
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Health check endpoint returns 200 OK');

    // 2. Auth Tests
    console.log('\n--- Phase 2: Authentication & User Registration ---');
    const adminEmail = `admin_${Date.now()}@codealpha.test`;
    const memberEmail = `member_${Date.now()}@codealpha.test`;

    const regAdmin = await request('POST', '/api/auth/register', {
      name: 'Alice Admin',
      email: adminEmail,
      password: 'password123',
      jobTitle: 'Engineering Lead',
    });
    assert(regAdmin.status === 201 && regAdmin.data.token, 'Alice registers successfully with JWT token');
    const adminToken = regAdmin.data.token;
    const adminId = regAdmin.data.user._id;

    const regMember = await request('POST', '/api/auth/register', {
      name: 'Bob Developer',
      email: memberEmail,
      password: 'password123',
      jobTitle: 'Backend Engineer',
    });
    assert(regMember.status === 201 && regMember.data.token, 'Bob registers successfully with JWT token');
    const memberToken = regMember.data.token;
    const memberId = regMember.data.user._id;

    // Login test
    const loginFail = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: 'wrongpassword',
    });
    assert(loginFail.status === 401, 'Login rejects incorrect password');

    const loginSuccess = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: 'password123',
    });
    assert(loginSuccess.status === 200 && loginSuccess.data.token, 'Login succeeds with correct credentials');

    // Me endpoint
    const meRes = await request('GET', '/api/auth/me', null, adminToken);
    assert(meRes.status === 200 && meRes.data.user.email === adminEmail, 'GET /api/auth/me returns authenticated user profile');

    // 3. Project Creation & Membership
    console.log('\n--- Phase 3: Project Management & Members ---');
    const createProj = await request(
      'POST',
      '/api/projects',
      {
        title: 'Alpha Cloud Infrastructure',
        description: 'Migrating legacy monolith services to microservices container architecture.',
        category: 'Development',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      },
      adminToken
    );
    assert(createProj.status === 201 && createProj.data.project._id, 'Alice creates project successfully');
    const projectId = createProj.data.project._id;

    // Alice invites Bob to the project
    const addMemberRes = await request(
      'POST',
      `/api/projects/${projectId}/members`,
      { email: memberEmail, role: 'member' },
      adminToken
    );
    assert(addMemberRes.status === 200, 'Alice adds Bob as a team member to the project');

    // Bob lists projects
    const bobProjects = await request('GET', '/api/projects', null, memberToken);
    const hasProject = bobProjects.data.projects.some((p) => p._id === projectId);
    assert(bobProjects.status === 200 && hasProject, 'Bob can see projects he is a member of');

    // 4. Task Creation, Assignment & Status
    console.log('\n--- Phase 4: Task Creation, Assignment & Board Columns ---');
    const createTaskRes = await request(
      'POST',
      `/api/projects/${projectId}/tasks`,
      {
        title: 'Provision Kubernetes Cluster',
        description: 'Set up EKS cluster with Terraform and configure autoscaling worker nodes.',
        status: 'todo',
        priority: 'urgent',
        assignee: memberId, // Assign to Bob
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        tags: ['DevOps', 'Kubernetes'],
      },
      adminToken
    );
    assert(createTaskRes.status === 201 && createTaskRes.data.task._id, 'Alice creates task and assigns it to Bob');
    const taskId = createTaskRes.data.task._id;
    assert(createTaskRes.data.task.assignee._id === memberId, 'Task assignee is properly linked to Bob');

    // Bob checks My Tasks
    const myTasksRes = await request('GET', '/api/tasks/my-tasks', null, memberToken);
    assert(
      myTasksRes.status === 200 && myTasksRes.data.tasks.some((t) => t._id === taskId),
      'Bob sees the assigned task in GET /api/tasks/my-tasks'
    );

    // Bob moves task status to "in_progress" (Kanban column move)
    const statusUpdateRes = await request(
      'PATCH',
      `/api/tasks/${taskId}/status`,
      { status: 'in_progress' },
      memberToken
    );
    assert(
      statusUpdateRes.status === 200 && statusUpdateRes.data.task.status === 'in_progress',
      'Bob updates task status to "in_progress"'
    );

    // 5. Comments & Task Communication
    console.log('\n--- Phase 5: Task Comments & Communication ---');
    const comment1 = await request(
      'POST',
      `/api/tasks/${taskId}/comments`,
      { content: 'Cluster configuration terraform scripts created. Initializing dry run.' },
      memberToken
    );
    assert(comment1.status === 201 && comment1.data.comment._id, 'Bob adds a comment on the task');
    const commentId = comment1.data.comment._id;

    const comment2 = await request(
      'POST',
      `/api/tasks/${taskId}/comments`,
      { content: 'Great progress Bob! Ensure VPC peering is restricted.' },
      adminToken
    );
    assert(comment2.status === 201, 'Alice replies with a comment on the task');

    const getComments = await request('GET', `/api/tasks/${taskId}/comments`, null, memberToken);
    assert(getComments.status === 200 && getComments.data.comments.length === 2, 'Fetched all task comments with author information');

    // 6. Security & Permission Guards
    console.log('\n--- Phase 6: Authorization & Security Checks ---');
    const strangerReg = await request('POST', '/api/auth/register', {
      name: 'Eve Stranger',
      email: `stranger_${Date.now()}@codealpha.test`,
      password: 'password123',
    });
    const strangerToken = strangerReg.data.token;

    const unauthorizedAccess = await request('GET', `/api/projects/${projectId}`, null, strangerToken);
    assert(unauthorizedAccess.status === 403, 'Unauthorized user is forbidden (403) from accessing private project');

    const unauthorizedTaskCreate = await request(
      'POST',
      `/api/projects/${projectId}/tasks`,
      { title: 'Hacked task' },
      strangerToken
    );
    assert(unauthorizedTaskCreate.status === 403, 'Unauthorized user cannot create tasks in project');

    // Clean up
    console.log('\n--- Phase 7: Clean-up and Cascade Deletion ---');
    const deleteRes = await request('DELETE', `/api/projects/${projectId}`, null, adminToken);
    assert(deleteRes.status === 200, 'Project and cascading tasks deleted cleanly by owner');

    console.log('\n======================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    server.close();
    await disconnectDB();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
};

runTests();
