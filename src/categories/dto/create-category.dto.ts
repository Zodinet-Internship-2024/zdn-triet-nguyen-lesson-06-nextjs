import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @Length(3, 30)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  desc: string;
}
