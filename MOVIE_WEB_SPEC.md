# MOVIE WEB — SPEC CHO ANTIGRAVITY

## 0. Mục tiêu

Xây dựng một web phim hoàn chỉnh từ số 0 để học và thực hành Frontend + Backend.

Mục tiêu giai đoạn 1:
- Tạo project từ đầu.
- Tạo database.
- Kết nối backend với database.
- Lấy danh sách/phim và metadata từ API bên thứ 3 hợp pháp.
- Đồng bộ metadata vào database của mình.
- Xây dựng API backend cho frontend.
- Xây dựng web frontend.
- Có trang danh sách, tìm kiếm, chi tiết phim, danh sách tập và trang xem.
- Có admin cơ bản để quản lý dữ liệu đã đồng bộ.
- Không scrape/copy nội dung có bản quyền trái phép.
- Không tự ý host hoặc phân phối video nếu không có quyền.

## 1. Stack bắt buộc

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- App Router
- Axios hoặc fetch
- TanStack Query nếu thực sự cần
- Responsive desktop/mobile
- Dark cinematic UI

### Backend
- NestJS
- TypeScript
- REST API
- Swagger/OpenAPI
- Prisma ORM
- PostgreSQL
- JWT authentication
- class-validator
- ConfigModule / environment variables

### Dev
- Git
- Docker Compose cho PostgreSQL
- ESLint + Prettier
- .env / .env.example

Không thêm công nghệ không cần thiết nếu chưa có lý do.

## 2. Cấu trúc repository

Tạo monorepo đơn giản:

movie-web/
├── backend/
├── frontend/
├── docker-compose.yml
├── .gitignore
├── README.md
└── docs/
    └── MOVIE_WEB_SPEC.md

Backend:
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── movies/
│   ├── genres/
│   ├── episodes/
│   ├── favorites/
│   ├── history/
│   ├── external-movies/
│   ├── admin/
│   ├── prisma/
│   ├── common/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
└── .env.example

Frontend:
frontend/
├── app/
│   ├── page.tsx
│   ├── movies/
│   ├── search/
│   ├── watch/
│   ├── login/
│   └── admin/
├── components/
├── lib/
├── hooks/
├── types/
└── public/

## 3. Tạo project từ đầu

Antigravity phải thực hiện theo thứ tự, không nhảy thẳng vào UI.

### Bước 1
Kiểm tra môi trường:
- Node.js
- npm/pnpm
- Docker
- Git

In version ra terminal.

Nếu thiếu dependency quan trọng thì báo rõ trước khi tiếp tục.

### Bước 2
Tạo:
- NestJS backend
- Next.js frontend
- PostgreSQL bằng Docker Compose

### Bước 3
Chạy project tối thiểu và xác nhận:
- Backend chạy được.
- Frontend chạy được.
- PostgreSQL chạy được.
- Backend kết nối PostgreSQL được.

Tạo endpoint:
GET /health

Response:
{
  "status": "ok"
}

## 4. PostgreSQL

docker-compose.yml phải có PostgreSQL.

Dùng biến môi trường:

DATABASE_URL=postgresql://...

Không hard-code password trong source.

Tạo .env.example nhưng không commit .env thật.

## 5. Database schema

Dùng Prisma.

### User

- id
- email
- passwordHash
- role
- createdAt
- updatedAt

Role:
- USER
- ADMIN

### Movie

- id
- externalId
- title
- originalTitle
- slug
- overview
- posterUrl
- backdropUrl
- releaseDate
- releaseYear
- rating
- voteCount
- runtime
- status
- country
- originalLanguage
- source
- createdAt
- updatedAt

externalId + source phải có unique constraint phù hợp để tránh import trùng.

### Genre

- id
- name
- slug

### MovieGenre

- movieId
- genreId

Unique:
(movieId, genreId)

### Episode

- id
- movieId
- externalId
- episodeNumber
- seasonNumber
- title
- overview
- thumbnailUrl
- duration
- videoUrl
- subtitleUrl
- source
- createdAt
- updatedAt

Lưu ý:
videoUrl/subtitleUrl chỉ chứa URL nguồn mà hệ thống có quyền sử dụng. Không tải/copy video có bản quyền trái phép.

### Favorite

- id
- userId
- movieId
- createdAt

Unique:
(userId, movieId)

### WatchHistory

- id
- userId
- movieId
- episodeId
- progressSeconds
- completed
- updatedAt

## 6. API phim bên thứ 3

Mục tiêu là lấy metadata phim từ một API bên thứ 3 có API chính thức và điều khoản sử dụng rõ ràng.

Ưu tiên:
- TMDB API cho metadata/phim.
- Không dùng nguồn phim lậu.
- Không scrape website phim nếu điều khoản không cho phép.
- Không lấy URL stream trái phép.

Tạo module:

external-movies/

Có service chịu trách nhiệm gọi API bên thứ 3.

Ví dụ:

ExternalMovieService:
- getPopularMovies()
- getTrendingMovies()
- searchMovies(query)
- getMovieDetail(externalId)
- getMovieCredits(externalId)
- getMovieGenres()
- getMovieImages(externalId)

API key phải nằm trong .env:

TMDB_API_KEY=

Không commit API key.

## 7. Đồng bộ dữ liệu

Không để frontend gọi trực tiếp API bên thứ 3 trong mọi request.

Flow:

Third-party API
        ↓
Backend ExternalMovieService
        ↓
Normalize data
        ↓
PostgreSQL
        ↓
Backend Movie API
        ↓
Frontend

Tạo endpoint admin:

POST /admin/movies/sync/popular

POST /admin/movies/sync/trending

POST /admin/movies/sync/:externalId

Mục tiêu:
- gọi API ngoài
- map dữ liệu
- upsert database
- tránh duplicate
- trả kết quả sync

Ví dụ response:

{
  "success": true,
  "created": 12,
  "updated": 8,
  "skipped": 0
}

## 8. Movie API

Tạo:

GET /movies

Query:
- page
- limit
- search
- genre
- year
- sort

GET /movies/:id

GET /movies/slug/:slug

GET /movies/:id/episodes

GET /movies/trending

GET /movies/popular

GET /movies/latest

GET /genres

GET /genres/:id/movies

GET /search?q=

Response phải có pagination.

Ví dụ:

{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}

## 9. Authentication

Tạo:

POST /auth/register
POST /auth/login
GET /auth/me

JWT.

Password phải hash bằng bcrypt hoặc argon2.

Không bao giờ trả passwordHash về frontend.

Guard:
- JwtAuthGuard
- RolesGuard

Admin API phải yêu cầu role ADMIN.

## 10. Favorite

POST /favorites/:movieId
DELETE /favorites/:movieId
GET /favorites

Chỉ user đã đăng nhập mới sử dụng được.

## 11. Watch History

POST /history

Body:

{
  "movieId": "...",
  "episodeId": "...",
  "progressSeconds": 123
}

GET /history

Có thể dùng dữ liệu này cho:
- Continue Watching
- Resume episode

## 12. Frontend

Trang chủ:

/
- Hero movie
- Trending
- Popular
- Latest
- Genres
- Movie cards

Trang danh sách:

/movies

Có:
- pagination
- filter
- sort

Trang tìm kiếm:

/search?q=

Trang chi tiết:

/movies/[slug]

Hiển thị:
- poster
- backdrop
- title
- rating
- year
- overview
- genres
- cast nếu có
- episodes
- nút xem
- favorite

Trang xem:

/watch/[movieId]/[episodeId]

Có:
- video player
- episode selector
- previous/next
- movie info

Nếu videoUrl không tồn tại:
hiển thị thông báo "Chưa có nguồn phát hợp lệ".

Không tạo workaround để lấy stream từ nguồn không được phép.

## 13. UI

Phong cách:
- Dark
- Cinematic
- Modern
- Responsive

Movie card:
- poster
- title
- year
- rating

Hover desktop:
- scale nhẹ
- hiện overlay
- nút Play

Mobile:
- không phụ thuộc hover.

Loading:
- skeleton.

Error:
- error state rõ ràng.

Empty:
- "Không tìm thấy phim."

## 14. Admin

/admin

Dashboard:
- tổng số phim
- tổng số tập
- tổng user
- số phim mới sync

/admin/movies
- list
- search
- delete
- edit metadata

/admin/sync
- sync popular
- sync trending
- sync movie theo externalId

Không cho admin nhập tùy ý nguồn stream trái phép.

## 15. Swagger

Backend phải expose Swagger ở:

/api/docs

Tất cả endpoint quan trọng phải có:
- description
- request body
- response
- auth requirement

## 16. Error handling

Chuẩn hóa response lỗi.

Không trả stack trace cho production.

Ví dụ:

{
  "statusCode": 404,
  "message": "Movie not found",
  "error": "Not Found"
}

External API lỗi:
- log lỗi server
- frontend nhận lỗi chuẩn hóa
- không lộ API key.

## 17. Validation

Validate:
- email
- password
- pagination
- IDs
- search query
- episode number

Bật global ValidationPipe.

## 18. Security cơ bản

- JWT secret trong .env
- API key trong .env
- password hashing
- CORS cấu hình đúng
- validation
- rate limiting cho auth nếu cần
- không log password/token/API key
- không commit secret

## 19. Seed database

Tạo Prisma seed để có:
- 1 admin
- 1 user
- một số genre mẫu

Admin test:
email/password lấy từ environment hoặc giá trị development rõ ràng trong README.

Không hard-code credential production.

## 20. Testing

Backend tối thiểu:
- auth register/login
- GET movies
- GET movie detail
- favorite
- history
- external sync

Frontend tối thiểu:
- homepage render
- movie list
- movie detail
- login

## 21. README

README phải hướng dẫn người mới:

1. Clone project
2. Cài dependency
3. Tạo .env
4. Điền TMDB_API_KEY
5. Start PostgreSQL
6. Prisma migrate
7. Seed
8. Start backend
9. Start frontend
10. Mở Swagger
11. Sync movie

Ví dụ commands phải đúng với project thực tế.

## 22. Quy tắc làm việc cho Antigravity

RẤT QUAN TRỌNG:

Không làm toàn bộ project một lần.

Chia thành các milestone:

### Milestone 1
Project + Docker + PostgreSQL + Prisma + health check.

### Milestone 2
Movie/Genre/Episode schema + migration + seed.

### Milestone 3
Movie API + Swagger.

### Milestone 4
Third-party metadata API + sync.

### Milestone 5
Auth + JWT.

### Milestone 6
Favorite + Watch History.

### Milestone 7
Next.js UI:
Home → Movies → Detail → Search.

### Milestone 8
Watch page.

### Milestone 9
Admin.

### Milestone 10
Testing + cleanup + Docker + README.

Sau MỖI milestone:
- chạy app
- kiểm tra lỗi
- test API
- nếu có lỗi thì sửa
- báo ngắn gọn đã hoàn thành gì
- không tự ý bỏ qua lỗi.

## 23. Quy tắc code

- TypeScript strict.
- Không dùng any nếu có thể tránh.
- Tách module rõ ràng.
- Controller mỏng.
- Business logic nằm trong service.
- Database access qua Prisma.
- DTO riêng.
- Không để secret trong source.
- Không copy code vô nghĩa.
- Không tạo file thừa.
- Tên biến/hàm rõ ràng.
- Comment chỉ khi thực sự cần.

## 24. Việc đầu tiên phải làm

Bắt đầu bằng Milestone 1.

Không tạo giao diện phim trước.

Hãy:

1. Kiểm tra Node/npm/Docker/Git.
2. Tạo folder project.
3. Tạo NestJS backend.
4. Tạo Next.js frontend.
5. Tạo docker-compose PostgreSQL.
6. Cấu hình .env.
7. Cài Prisma.
8. Kết nối PostgreSQL.
9. Tạo GET /health.
10. Chạy thử backend + frontend + database.
11. Kiểm tra không có lỗi.
12. Sau khi Milestone 1 hoàn thành mới chuyển Milestone 2.

Khi gặp lựa chọn kỹ thuật, ưu tiên:
- đơn giản
- dễ hiểu
- dễ debug
- phù hợp người đang học Backend
- có khả năng mở rộng sau này.

## 25. Phạm vi nội dung

Project này chỉ sử dụng:
- metadata từ API bên thứ 3 có quyền sử dụng;
- hình ảnh/asset theo điều khoản của nguồn;
- video mà người phát triển có quyền sử dụng hoặc nguồn stream hợp pháp.

Không xây dựng tính năng nhằm:
- bypass DRM;
- lấy stream trái phép;
- scrape website phim lậu;
- tải lại phim có bản quyền để rehost;
- vượt giới hạn truy cập của bên thứ 3.

Nếu cần demo video, dùng video mẫu/public-domain hoặc một nguồn mà developer có quyền sử dụng.

## 26. Definition of Done cho Milestone 1

Chỉ coi Milestone 1 hoàn thành khi:

[ ] frontend chạy
[ ] backend chạy
[ ] PostgreSQL chạy
[ ] backend kết nối database
[ ] GET /health trả 200
[ ] .env.example tồn tại
[ ] README có hướng dẫn chạy
[ ] không commit secret
[ ] không có lỗi build
[ ] git status sạch ngoại trừ file người dùng chưa commit nếu có

Sau đó mới bắt đầu Milestone 2.
