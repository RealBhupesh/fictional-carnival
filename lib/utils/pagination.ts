export const getPagination = (page?: string | number, perPage?: string | number) => {
  const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(perPage as string, 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * pageSize;
  const take = pageSize;

  return { page: pageNumber, perPage: pageSize, skip, take };
};
