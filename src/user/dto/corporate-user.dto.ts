export class CorporateUserDto {
  id: number;
  companyName: string;
  businessType: string;
  dateOfIncorporation: Date;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CorporateUserDto>) {
    Object.assign(this, partial);
  }
}
