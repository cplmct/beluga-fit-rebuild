export async function safeQuery<T>(queryBuilder: any): Promise<T> {
  const { data, error } = await queryBuilder;
  if (error) {
    if (__DEV__) {
      console.error(error);
    }
    throw new Error(error.message || 'Something went wrong');
  }
  return data as T;
}