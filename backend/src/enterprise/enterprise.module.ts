import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseController } from './enterprise.controller';
import {
  Organization,
  Department,
  Team,
  TeamMember,
  OrganizationMember,
  Project,
  ProjectMember,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      Department,
      Team,
      TeamMember,
      OrganizationMember,
      Project,
      ProjectMember,
    ]),
  ],
  controllers: [EnterpriseController],
  providers: [EnterpriseService],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
