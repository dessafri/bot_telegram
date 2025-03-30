export const reponseSuccess = (
  StatusCode: number,
  data: any,
  message: string
) => {
  return {
    statusCode: StatusCode,
    data: data,
    message: message,
  };
};
export const responseError = (
  statusCode: number,
  error: string,
  message: string
) => {
  return {
    success: false,
    statusCode,
    message,
    error,
  };
};
