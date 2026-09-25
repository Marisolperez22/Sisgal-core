
import { DocumentType } from './document-type.enum';

import { EmptyDocumentNumberError, InvalidDocumentFormatError } from '../errors/employee.errors';

export class DocumentId {
  private constructor(
    private readonly type: DocumentType,
    private readonly number: string,
  ) {}

  static create(type: DocumentType, number: string): DocumentId {
    if (!number || number.trim().length === 0) {
      throw new EmptyDocumentNumberError();
    }

    if (!/^\d+$/.test(number)) {
      throw new InvalidDocumentFormatError();
    }

    return new DocumentId(type, number);
  }

  getType(): DocumentType {
    return this.type;
  }

  getNumber(): string {
    return this.number;
  }

  equals(other: DocumentId): boolean {
    return this.type === other.type && this.number === other.number;
  }
}