const http = require('http');

const API_BASE = 'http://localhost:4000';
const FRONTEND_BASE = 'http://localhost:3000';

const results = [];

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function assertTest(name, condition, details = '') {
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    results.push({ name, status: 'PASS', details });
  } else {
    console.log(`❌ [FAIL] ${name} - ${details}`);
    results.push({ name, status: 'FAIL', details });
  }
}

async function runQA() {
  console.log('\n🚀 BẮT ĐẦU RUNTIME QA SUITE CHO TOÀN BỘ HỆ THỐNG MOVIE WEB\n');

  let adminToken = '';
  let userToken = '';
  let demoMovieId = '';
  let demoEpisodeId = '';

  // 1. Health check
  try {
    const res = await request(`${API_BASE}/health`);
    assertTest('GET /health: Backend & PostgreSQL kết nối', res.status === 200 && res.body.status === 'ok', `status=${res.status}, db=${res.body.database}`);
  } catch (err) {
    assertTest('GET /health: Backend & PostgreSQL kết nối', false, err.message);
  }

  // 2. Auth - Admin Login
  try {
    const res = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: { email: 'admin@movieweb.com', password: 'Admin@123456' },
    });
    adminToken = res.body?.accessToken;
    assertTest('POST /auth/login: Đăng nhập Admin', res.status === 200 && !!adminToken && res.body?.user?.role === 'ADMIN', `role=${res.body?.user?.role}`);
  } catch (err) {
    assertTest('POST /auth/login: Đăng nhập Admin', false, err.message);
  }

  // 3. Auth - User Login
  try {
    const res = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: { email: 'user@movieweb.com', password: 'User@123456' },
    });
    userToken = res.body?.accessToken;
    assertTest('POST /auth/login: Đăng nhập User', res.status === 200 && !!userToken && res.body?.user?.role === 'USER', `role=${res.body?.user?.role}`);
  } catch (err) {
    assertTest('POST /auth/login: Đăng nhập User', false, err.message);
  }

  // 4. Auth - Profile GET /auth/me
  try {
    const res = await request(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assertTest('GET /auth/me: Tra cứu thông tin cá nhân', res.status === 200 && res.body?.email === 'user@movieweb.com', `email=${res.body?.email}`);
  } catch (err) {
    assertTest('GET /auth/me: Tra cứu thông tin cá nhân', false, err.message);
  }

  // 5. Auth - Register New User
  const testEmail = `test_${Date.now()}@example.com`;
  try {
    const res = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: { email: testEmail, password: 'Password@123' },
    });
    assertTest('POST /auth/register: Đăng ký thành viên mới', res.status === 201 && !!res.body?.accessToken, `email=${res.body?.user?.email}`);
  } catch (err) {
    assertTest('POST /auth/register: Đăng ký thành viên mới', false, err.message);
  }

  // 6. Genres
  try {
    const res = await request(`${API_BASE}/genres`);
    assertTest('GET /genres: Lấy 17 thể loại phim', res.status === 200 && Array.isArray(res.body) && res.body.length >= 17, `totalGenres=${res.body?.length}`);
  } catch (err) {
    assertTest('GET /genres: Lấy 17 thể loại phim', false, err.message);
  }

  // 7. Movies list & filters
  try {
    const res = await request(`${API_BASE}/movies?page=1&limit=10`);
    assertTest('GET /movies: Danh sách phim phân trang', res.status === 200 && Array.isArray(res.body?.items) && res.body?.items.length > 0, `total=${res.body?.total}`);
    if (res.body?.items?.length > 0) {
      demoMovieId = res.body.items[0].id;
    }
  } catch (err) {
    assertTest('GET /movies: Danh sách phim phân trang', false, err.message);
  }

  // 8. Movie Detail by Slug
  try {
    const res = await request(`${API_BASE}/movies/slug/big-buck-bunny`);
    assertTest('GET /movies/slug/:slug: Chi tiết phim & danh sách tập', res.status === 200 && res.body?.slug === 'big-buck-bunny' && res.body?.episodes?.length > 0, `title=${res.body?.title}, episodes=${res.body?.episodes?.length}`);
    if (res.body?.episodes?.length > 0) {
      demoEpisodeId = res.body.episodes[0].id;
    }
  } catch (err) {
    assertTest('GET /movies/slug/:slug: Chi tiết phim & danh sách tập', false, err.message);
  }

  // 9. Episode detail
  if (demoEpisodeId) {
    try {
      const res = await request(`${API_BASE}/episodes/${demoEpisodeId}`);
      assertTest('GET /episodes/:id: Chi tiết tập phim & video URL', res.status === 200 && !!res.body?.videoUrl, `videoUrl=${res.body?.videoUrl}`);
    } catch (err) {
      assertTest('GET /episodes/:id: Chi tiết tập phim & video URL', false, err.message);
    }
  }

  // 10. Favorites Flow
  if (demoMovieId) {
    try {
      // Add favorite
      const addRes = await request(`${API_BASE}/favorites/${demoMovieId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      // Check status
      const statusRes = await request(`${API_BASE}/favorites/${demoMovieId}/status`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      // Get list
      const listRes = await request(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assertTest('Favorites API: Thêm, kiểm tra trạng thái & danh sách yêu thích', addRes.status === 201 && statusRes.body?.isFavorite === true && listRes.body?.items?.length > 0, `isFavorite=${statusRes.body?.isFavorite}`);

      // Remove favorite
      const delRes = await request(`${API_BASE}/favorites/${demoMovieId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assertTest('DELETE /favorites/:movieId: Xóa phim khỏi danh sách yêu thích', delRes.status === 200, `delStatus=${delRes.status}`);
    } catch (err) {
      assertTest('Favorites API', false, err.message);
    }
  }

  // 11. Watch History Flow (Save progress & Resume)
  if (demoMovieId && demoEpisodeId) {
    try {
      // Save history
      const saveRes = await request(`${API_BASE}/history`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: {
          movieId: demoMovieId,
          episodeId: demoEpisodeId,
          progressSeconds: 125,
          completed: false,
        },
      });
      // Get progress
      const progRes = await request(`${API_BASE}/history/movie/${demoMovieId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assertTest('Watch History API: Lưu tiến độ xem & khôi phục (Resume)', saveRes.status === 201 && progRes.body?.progressSeconds === 125, `progressSeconds=${progRes.body?.progressSeconds}`);
    } catch (err) {
      assertTest('Watch History API', false, err.message);
    }
  }

  // 12. Admin Dashboard Stats
  try {
    const res = await request(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertTest('GET /admin/stats: Thống kê số liệu Admin', res.status === 200 && res.body?.totalMovies >= 1 && res.body?.totalGenres >= 17, `movies=${res.body?.totalMovies}, users=${res.body?.totalUsers}`);
  } catch (err) {
    assertTest('GET /admin/stats: Thống kê số liệu Admin', false, err.message);
  }

  // 13. Admin Role Protection (Forbidden when User token used)
  try {
    const res = await request(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assertTest('Security: Chặn User thường truy cập Admin endpoint (403 Forbidden)', res.status === 403, `statusCode=${res.status}`);
  } catch (err) {
    assertTest('Security: Chặn User thường truy cập Admin', false, err.message);
  }

  // 14. Frontend Routes Accessibility
  const frontendRoutes = [
    '/',
    '/movies',
    '/search',
    '/login',
    '/register',
    '/favorites',
    '/admin',
    '/admin/movies',
    '/admin/sync',
  ];

  for (const route of frontendRoutes) {
    try {
      const res = await request(`${FRONTEND_BASE}${route}`);
      assertTest(`Frontend Route: ${route}`, res.status === 200, `status=${res.status}`);
    } catch (err) {
      assertTest(`Frontend Route: ${route}`, false, err.message);
    }
  }

  // 15. Frontend Watch Page
  if (demoMovieId && demoEpisodeId) {
    try {
      const res = await request(`${FRONTEND_BASE}/watch/${demoMovieId}/${demoEpisodeId}`);
      assertTest(`Frontend Watch Page: /watch/${demoMovieId.slice(0, 8)}.../${demoEpisodeId.slice(0, 8)}...`, res.status === 200, `status=${res.status}`);
    } catch (err) {
      assertTest('Frontend Watch Page', false, err.message);
    }
  }

  console.log('\n=========================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`📊 TỔNG KẾT RUNTIME QA: ${passCount} PASSED / ${results.length} TESTS (${failCount} FAILED)`);
  console.log('=========================================\n');
}

runQA().catch((err) => {
  console.error('QA Runner encountered critical error:', err);
  process.exit(1);
});
