export type FindAdminUsersDto = {
  search: string;

  limit: number;

  page: number;

  isActive: boolean;
}