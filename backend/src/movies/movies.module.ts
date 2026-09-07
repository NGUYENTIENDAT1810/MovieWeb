import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { SearchController } from './search.controller';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController, SearchController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
