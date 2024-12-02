export interface CreateSubscriptionDto {
    name: string;
    description: string;
    amount: number;
    interval: string;
  }
  
  export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {}