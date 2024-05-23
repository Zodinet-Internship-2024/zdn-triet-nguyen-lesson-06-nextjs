import {
  IsString,
  IsInt,
  Length,
  IsPositive,
  IsUrl,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateProductDto {
  @Length(3, 30)
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  desc: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsPositive()
  @IsOptional()
  discount: number;

  @IsUrl()
  @IsOptional()
  image: string;

  @IsInt()
  @IsNotEmpty()
  category: number;
}
