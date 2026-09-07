import { Module } from '@nestjs/common';
import { ExternalMoviesModule } from '../external-movies/external-movies.module';
import { AdminSyncService } from './admin-sync.service';
import { AdminSyncController } from './admin-sync.controller';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [ExternalMoviesModule],
  controllers: [AdminController, AdminSyncController],
  providers: [AdminService, AdminSyncService],
  exports: [AdminService, AdminSyncService],
})
export class AdminModule {}
