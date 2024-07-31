import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({
      where: {
        avaliable: true,
      },
    });
    const lastPage = Math.ceil(totalPages / limit);
    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          avaliable: true,
        },
      }),
      meta: {
        page: page,
        totalPages: totalPages,
        lastPage: lastPage,
      },
    };
  }

  findOne(id: number) {
    const product = this.product.findFirst({
      where: { id, avaliable: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} is not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);
    return this.product.update({ where: { id }, data: data });
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where: { id },
      data: {
        avaliable: false,
      },
    });
    return product;
  }
}
