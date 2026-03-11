import { NotFoundException } from '@nestjs/common';

export class ResourceNotFoundException extends NotFoundException {
    constructor(recurso: string, id: string) {
        super(`${recurso} com id ${id} não encontrado.`);
    }
}