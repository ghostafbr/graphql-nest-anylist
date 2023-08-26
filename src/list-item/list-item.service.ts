import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from '../lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { listId, itemId, ...rest } = createListItemInput;
    const newListItem = this.listItemRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });
    await this.listItemRepository.save(newListItem);
    return this.findOne(newListItem.id);
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder('listItem')
      .innerJoin('listItem.list', 'list')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere(`LOWER(name) like :name`, {
        name: `%${search.toLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
  }

  async countItemsByList(list: List): Promise<number> {
    return this.listItemRepository.count({
      where: {
        list: { id: list.id },
      },
    });
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = this.listItemRepository.findOneBy({ id });
    if (!listItem) {
      throw new Error(`No list item found with id: ${id}`);
    }
    return listItem;
  }

  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    const { listId, itemId, ...rest } = updateListItemInput;

    /*const listItem = await this.listItemRepository.preload({
      ...rest,
      list: { id: listId },
      item: { id: itemId },
    });*/

    const queryBuilder = this.listItemRepository
      .createQueryBuilder()
      .update()
      .set(rest)
      .where('id = :id', { id });

    if (listId) {
      queryBuilder.set({ list: { id: listId } });
    }
    if (itemId) {
      queryBuilder.set({ item: { id: itemId } });
    }

    await queryBuilder.execute();
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}
