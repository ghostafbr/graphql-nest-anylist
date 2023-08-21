import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateItemInput, UpdateItemInput } from './dto/inputs/';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemInput);
    return await this.itemsRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    // TODO: Add pagination, sorting, and filtering
    return await this.itemsRepository.find(); // This will return all items
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Item with ${id} not found`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`Item with ${id} not found`);
    return await this.itemsRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    // TODO: Soft delete, referencial integrity
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }
}
