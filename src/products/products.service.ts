import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDTO } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  

  private readonly logger = new Logger( 'ProductService');
  
  onModuleInit() {
    this.$connect();
    this.logger.log('Database Connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      
      data: createProductDto
      
    });
  }

  async findAll(paginationDTO: PaginationDTO) {
    
    //Saca esos 2 elementos del objeto
    const { page, limit } = paginationDTO;
    
    //Numero total de paginas
    const totalPages = await this.product.count({where: { available: true}});
    const lastPage = Math.ceil(totalPages / limit);


    return {
      data: await this.product.findMany({
        //Operacion para paginar de 10 en 10
      skip: ( page - 1) * limit,
      take: limit,
      where:{ available: true

      },
      }),
      meta:{
        
        totalPages: totalPages,
        page: page,
        lastPage: lastPage,
        
      }
    }
  }

  async findOne(id: number) {

    const product = await this.product.findFirst({
        where: {id : id, available: true} // propiedad db : argumento recibido
      }) 

      if(!product){
        throw new RpcException({
          message: `Product with id: #${ id } not found`,
          status: HttpStatus.BAD_REQUEST
        });
      }

      return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    
    //Desestructura el updateProductDto
    const { id: _id, ...data} = updateProductDto;
    
    
    await this.findOne(id);
    
    return this.product.update({
      where: {id : id},
      data: data,
    });

  }

  async remove(id: number) {

    await this.findOne(id);

   
    //aqui hacemos un soft Delete
const product = await this.product.update({

  where: { id },
  data: {
    available: false
  }
});

return product;

   
   //Esto borra fisicamente el dato de la db
    // return this.product.delete({
    //   where: { id } 
    // });

  }

  async validateProducts(ids: number[]) {
    
    ids = Array.from( new Set(ids) ); // Estructura de datos en JS sin duplicados, elimina los duplicados del array

    
    //Busca cada elemento del array en la db, regresara solo los id que existen
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    //compara el arreglo ids que llega contra el de products, si no tienen la misma longitud, manda error, 
    //de lo contrario manda los productos
    
    if(products.length !== ids.length){
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;

  }
}
