import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../items/entities/item.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from '../lists/entities/list.entity';
import { ListItemService } from '../list-item/list-item.service';
import { ListsService } from '../lists/lists.service';

@Injectable()
export class SeedService {
  private readonly isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService,
  ) {
    this.isProd = this.configService.get('STATE') === 'prod';
  }
  async executeSeed() {
    // Se comenta de manera temporal para poder ejecutar el seed en prod
    // Esto no es recomendable en un ambiente real
    /*if (this.isProd) {
      throw new UnauthorizedException('We cannot run SEED on Prod');
    }*/

    // Clean the DB (Delete everything)
    await this.deleteDatabase();
    // Create users
    const user = await this.loadUsers();
    // Create Items
    await this.loadItems(user);

    // Create Lists
    const list = await this.loadLists(user);

    // Create List Items
    const items = await this.itemsService.findAll(
      user,
      { limit: 15, offset: 0 },
      {},
    );
    await this.loadListItems(list, items);

    return true;
  }

  async deleteDatabase() {
    // Delete list items
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Delete lists
    await this.listRepository.createQueryBuilder().delete().where({}).execute();

    // Delete items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Delete Users
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User> {
    const users = [];
    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }
    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    const itemsPromises = [];
    for (const item of SEED_ITEMS) {
      itemsPromises.push(this.itemsService.create(item, user));
    }

    await Promise.all(itemsPromises);
  }

  async loadLists(user: User): Promise<List> {
    const lists = [];
    for (const list of SEED_LISTS) {
      lists.push(await this.listsService.create(list, user));
    }
    return lists[0];
  }

  async loadListItems(list: List, items: Item[]): Promise<void> {
    for (const item of items) {
      await this.listItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random()) === 1,
        listId: list.id,
        itemId: item.id,
      });
    }
  }
}
