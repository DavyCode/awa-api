export interface CreatePlanDto {
  name: string;
  description: string;
  amount: number;
  interval: string;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}
