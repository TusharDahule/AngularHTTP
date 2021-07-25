import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";

/* Before sending any request, we can add headers to all requests and configure them using Interceptors */
export class AuthInterceptorService implements HttpInterceptor{
  intercept(req: HttpRequest<any>, next: HttpHandler){
    console.log("Request is on its way");
    /* you can access request data using req*/
    /*  req object is immutable, you cannot modify, so use req.clone() */
    const modifiedRequest = req.clone({
      headers: req.headers.append('Auth','xyz')
    });

    /* Before sending any request, handle the request */
    return next.handle(modifiedRequest); /* returns observable */
  }
}
