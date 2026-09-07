import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu quá trình Seed Database...');

  // 1. Tạo Thể loại phim (Genres) chuẩn
  const genres = [
    { name: 'Hành Động', slug: 'hanh-dong' },
    { name: 'Phiêu Lưu', slug: 'phieu-luu' },
    { name: 'Hoạt Hình', slug: 'hoat-hinh' },
    { name: 'Hài Hước', slug: 'hai-huoc' },
    { name: 'Hình Sự', slug: 'hinh-su' },
    { name: 'Tài Liệu', slug: 'tai-lieu' },
    { name: 'Chính Kịch', slug: 'chinh-kich' },
    { name: 'Gia Đình', slug: 'gia-dinh' },
    { name: 'Giả Tưởng', slug: 'gia-tuong' },
    { name: 'Lịch Sử', slug: 'lich-su' },
    { name: 'Kinh Dị', slug: 'kinh-di' },
    { name: 'Âm Nhạc', slug: 'am-nhac' },
    { name: 'Bí Ẩn', slug: 'bi-an' },
    { name: 'Tình Cảm', slug: 'tinh-cam' },
    { name: 'Khoa Học Viễn Tưởng', slug: 'khoa-hoc-vien-tuong' },
    { name: 'Giật Gân', slug: 'giat-gan' },
    { name: 'Chiến Tranh', slug: 'chien-tranh' },
  ];

  console.log('🎬 Seeding Genres...');
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: { name: genre.name },
      create: {
        name: genre.name,
        slug: genre.slug,
      },
    });
  }
  console.log(`✅ Đã seed ${genres.length} thể loại phim.`);

  // 2. Tạo Tài khoản Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@movieweb.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Đã seed Admin: ${admin.email} (Role: ${admin.role})`);

  // 3. Tạo Tài khoản User mẫu
  const userEmail = process.env.USER_EMAIL || 'user@movieweb.com';
  const userPassword = process.env.USER_PASSWORD || 'User@123456';
  const userPasswordHash = await bcrypt.hash(userPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
    create: {
      email: userEmail,
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });
  console.log(`✅ Đã seed User: ${user.email} (Role: ${user.role})`);

  // 4. Tạo Phim mẫu (Demo Movie & Episodes)
  const actionGenre = await prisma.genre.findUnique({ where: { slug: 'khoa-hoc-vien-tuong' } });
  const sampleMovie = await prisma.movie.upsert({
    where: { slug: 'big-buck-bunny' },
    update: {},
    create: {
      externalId: 'demo-101',
      title: 'Big Buck Bunny (Demo Open Source)',
      originalTitle: 'Big Buck Bunny',
      slug: 'big-buck-bunny',
      overview: 'Bộ phim hoạt hình 3D mã nguồn mở kinh điển của Blender Foundation.',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1600&q=80',
      releaseDate: new Date('2008-04-10'),
      releaseYear: 2008,
      rating: 8.5,
      voteCount: 1500,
      runtime: 10,
      status: 'Released',
      country: 'Netherlands',
      originalLanguage: 'en',
      source: 'OPEN_SOURCE',
    },
  });

  if (actionGenre) {
    await prisma.movieGenre.upsert({
      where: {
        movieId_genreId: {
          movieId: sampleMovie.id,
          genreId: actionGenre.id,
        },
      },
      update: {},
      create: {
        movieId: sampleMovie.id,
        genreId: actionGenre.id,
      },
    });
  }

  // Tạo Episode mẫu với video stream công khai hợp lệ
  await prisma.episode.upsert({
    where: {
      movieId_seasonNumber_episodeNumber: {
        movieId: sampleMovie.id,
        seasonNumber: 1,
        episodeNumber: 1,
      },
    },
    update: {},
    create: {
      movieId: sampleMovie.id,
      externalId: 'demo-ep-1',
      episodeNumber: 1,
      seasonNumber: 1,
      title: 'Tập 1: Mở đầu',
      overview: 'Tập phim hoạt hình giới thiệu nhân vật Bunny.',
      duration: 10,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      source: 'OPEN_SOURCE',
    },
  });

  console.log(`✅ Đã seed Phim mẫu và Episode: ${sampleMovie.title}`);
  console.log('🎉 Quá trình Seed Database hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi Seed Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
