import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CategoryService {
  private readonly filePath: string = path.resolve(
    __dirname,
    '../../src/database/categories.json',
  );
  private categories: Category[] = [];

  constructor() {
    this.initializeCategories();
  }

  private async initializeCategories() {
    this.categories = await this.readCategoriesFromFile();
  }

  private async readCategoriesFromFile(): Promise<Category[]> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }

    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data) as Category[];
    } catch (error) {
      console.error('Error reading categories from file:', error);
      return [];
    }
  }

  private async saveCategoriesToFile(): Promise<void> {
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(this.categories, null, 2),
      );
    } catch (error) {
      console.error('Error saving categories to file:', error);
    }
  }

  async findAll(): Promise<Category[]> {
    await this.initializeCategories();
    return this.categories;
  }

  async findOne(id: number): Promise<Category> {
    await this.initializeCategories();
    const category = this.categories.find((category) => category.id === id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory: Category = {
      id: Number(this.categories.length)
        ? this.categories[this.categories.length - 1].id + 1
        : 1,
      ...createCategoryDto,
    };
    this.categories.push(newCategory);
    await this.saveCategoriesToFile();
    return newCategory;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const categoryIndex = this.categories.findIndex(
      (category) => category.id === id,
    );
    if (categoryIndex === -1) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const updatedCategory = {
      ...this.categories[categoryIndex],
      ...updateCategoryDto,
    };
    this.categories[categoryIndex] = updatedCategory;
    await this.saveCategoriesToFile();
    return updatedCategory;
  }

  async remove(id: number): Promise<void> {
    const categoryIndex = this.categories.findIndex(
      (category) => category.id === id,
    );
    if (categoryIndex === -1) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    this.categories.splice(categoryIndex, 1);
    await this.saveCategoriesToFile();
  }
}
