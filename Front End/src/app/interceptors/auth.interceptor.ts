import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Functional HTTP Interceptor that automatically attaches the
 * JWT bearer token to all outgoing API requests if the token exists in local storage.
 * Follows modern Angular (v15+) standalone patterns.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
