import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from './entities/plugin.entity';
import { UserPlugin } from './entities/user-plugin.entity';
import { CreatePluginDto, UpdatePluginDto, InstallPluginDto, UpdateUserPluginDto, QueryPluginsDto } from './dto/plugin.dto';

@Injectable()
export class PluginsService {
  private readonly logger = new Logger(PluginsService.name);

  constructor(
    @InjectRepository(Plugin)
    private pluginRepository: Repository<Plugin>,
    @InjectRepository(UserPlugin)
    private userPluginRepository: Repository<UserPlugin>,
  ) {}

  // ============ Plugin Registry ============

  async findAll(query: QueryPluginsDto): Promise<Plugin[]> {
    const qb = this.pluginRepository.createQueryBuilder('p')
      .where('p.isActive = true');

    if (query.category) {
      qb.andWhere('p.category = :category', { category: query.category });
    }

    if (query.officialOnly) {
      qb.andWhere('p.isOfficial = true');
    }

    if (query.search) {
      qb.andWhere(
        '(p.name ILIKE :search OR p.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb.orderBy('p.downloadCount', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Plugin> {
    const plugin = await this.pluginRepository.findOne({ where: { id } });
    if (!plugin) {
      throw new NotFoundException(`Plugin ${id} not found`);
    }
    return plugin;
  }

  async findBySlug(slug: string): Promise<Plugin> {
    const plugin = await this.pluginRepository.findOne({ where: { slug } });
    if (!plugin) {
      throw new NotFoundException(`Plugin with slug ${slug} not found`);
    }
    return plugin;
  }

  async create(dto: CreatePluginDto): Promise<Plugin> {
    const existing = await this.pluginRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(`Plugin with slug ${dto.slug} already exists`);
    }

    const plugin = this.pluginRepository.create(dto);
    return this.pluginRepository.save(plugin);
  }

  async update(id: string, dto: UpdatePluginDto): Promise<Plugin> {
    const plugin = await this.findOne(id);
    Object.assign(plugin, dto);
    return this.pluginRepository.save(plugin);
  }

  async delete(id: string): Promise<void> {
    const plugin = await this.findOne(id);
    await this.pluginRepository.remove(plugin);
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.pluginRepository.increment({ id }, 'downloadCount', 1);
  }

  // ============ User Plugins ============

  async install(userId: string, dto: InstallPluginDto): Promise<UserPlugin> {
    const plugin = await this.findOne(dto.pluginId);

    const existing = await this.userPluginRepository.findOne({
      where: { userId, pluginId: dto.pluginId },
    });

    if (existing) {
      throw new BadRequestException('Plugin already installed');
    }

    const userPlugin = this.userPluginRepository.create({
      userId,
      pluginId: dto.pluginId,
      version: plugin.version,
      status: 'active',
      config: dto.config || {},
    });

    await this.incrementDownloadCount(dto.pluginId);

    return this.userPluginRepository.save(userPlugin);
  }

  async findInstalled(userId: string): Promise<UserPlugin[]> {
    return this.userPluginRepository.find({
      where: { userId },
      relations: ['plugin'],
      order: { lastUsedAt: 'DESC' },
    });
  }

  async findActive(userId: string): Promise<UserPlugin[]> {
    return this.userPluginRepository.find({
      where: { userId, status: 'active' },
      relations: ['plugin'],
    });
  }

  async updateUserPlugin(
    id: string,
    userId: string,
    dto: UpdateUserPluginDto,
  ): Promise<UserPlugin> {
    const userPlugin = await this.userPluginRepository.findOne({
      where: { id, userId },
    });

    if (!userPlugin) {
      throw new NotFoundException(`User plugin ${id} not found`);
    }

    if (dto.enabled !== undefined) {
      userPlugin.status = dto.enabled ? 'active' : 'disabled';
    }

    if (dto.config) {
      userPlugin.config = { ...userPlugin.config, ...dto.config };
    }

    return this.userPluginRepository.save(userPlugin);
  }

  async uninstall(id: string, userId: string): Promise<void> {
    const userPlugin = await this.userPluginRepository.findOne({
      where: { id, userId },
    });

    if (!userPlugin) {
      throw new NotFoundException(`User plugin ${id} not found`);
    }

    await this.userPluginRepository.remove(userPlugin);
  }

  async updateLastUsed(id: string, userId: string): Promise<void> {
    await this.userPluginRepository.update({ id, userId }, { lastUsedAt: new Date() });
  }

  // ============ Plugin Execution ============

  async executePlugin(
    userId: string,
    pluginId: string,
    action: string,
    params: Record<string, any>,
  ): Promise<any> {
    const userPlugin = await this.userPluginRepository.findOne({
      where: { userId, pluginId, status: 'active' },
      relations: ['plugin'],
    });

    if (!userPlugin) {
      throw new NotFoundException('Plugin not installed or not active');
    }

    await this.updateLastUsed(userPlugin.id, userId);

    // Plugin execution would go through a sandboxed environment
    // For now, return a placeholder response
    this.logger.log(`Executing plugin ${userPlugin.plugin.name}, action: ${action}`);

    return {
      success: true,
      plugin: userPlugin.plugin.name,
      action,
      result: { executed: true },
    };
  }

  // ============ Categories ============

  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.pluginRepository
      .createQueryBuilder('p')
      .select('p.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('p.isActive = true')
      .groupBy('p.category')
      .getRawMany();
  }
}
