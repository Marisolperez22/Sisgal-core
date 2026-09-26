import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { DocumentType } from "../../../../../modules/empleados/domain/value-objects/document-type.enum";


export class RegisterEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsNumber()
  @Min(0.01)
  salaryBase!: number;

  @IsString()
  @IsNotEmpty()
  position!: string;
}