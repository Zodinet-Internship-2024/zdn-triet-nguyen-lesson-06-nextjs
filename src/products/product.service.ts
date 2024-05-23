import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateCategoryDto } from 'src/categories/dto/update-category.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProductService {
  private readonly filePath: string = path.resolve(
    __dirname,
    '../../src/database/products.json',
  );
  private products: Product[] = [];

  constructor() {
    this.initializeProducts();
  }

  private async initializeProducts() {
    this.products = await this.readProductsFromFile();
  }

  private async readProductsFromFile(): Promise<Product[]> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([]));
    }

    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data) as Product[];
    } catch (error) {
      console.error('Error reading products from file:', error);
      return [];
    }
  }

  private async saveProductsToFile(): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.products, null, 2));
    } catch (error) {
      console.error('Error saving products to file:', error);
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct: Product = {
      id: this.products.length
        ? this.products[this.products.length - 1].id + 1
        : 1,
      ...createProductDto,
    };
    this.products.push(newProduct);
    await this.saveProductsToFile();
    return newProduct;
  }

  async findAll(): Promise<Product[]> {
    await this.initializeProducts();
    return this.products;
  }

  async findOne(id: number): Promise<Product> {
    await this.initializeProducts();
    const product = this.products.find((product) => product.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateCategoryDto,
  ): Promise<Product> {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const updatedProduct = {
      ...this.products[productIndex],
      ...updateProductDto,
    };
    this.products[productIndex] = updatedProduct;
    await this.saveProductsToFile();
    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    const initialLength = this.products.length;
    this.products = this.products.filter((product) => product.id !== id);
    if (this.products.length === initialLength) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.saveProductsToFile();
  }
}
