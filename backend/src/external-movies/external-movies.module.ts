import { Module } from '@nestjs/common';
import { ExternalMovieService } from './external-movies.service';

@Module({
  providers: [ExternalMovieService],
  exports: [ExternalMovieService],
})
export class ExternalMoviesModule {}
