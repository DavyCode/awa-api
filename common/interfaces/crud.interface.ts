export interface CRUD {
  create: (resource: any) => Promise<any>;
  putById: (id: string, resource: any) => Promise<string>;
  getAll: (limit: number, page: number) => Promise<any>;
  getById: (id: string) => Promise<any>;
}