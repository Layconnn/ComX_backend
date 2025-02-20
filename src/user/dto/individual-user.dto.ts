export class IndividualUserDto {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<IndividualUserDto>) {
    Object.assign(this, partial);
  }
}
