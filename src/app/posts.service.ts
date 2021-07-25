import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Post } from "./post.model";

@Injectable({providedIn: 'root'})
export class PostsService{

  /* Look in Network tab while inspecting for Http requests and response*/
  error = new Subject<string>();

  constructor(private http:HttpClient){}

  createAndStorePosts(title:string,content:string){
 // Send Http request
 const postData:Post = {title: title,content:content};
 this.http.post<{name:string}>('https://zomatoliteapp-default-rtdb.firebaseio.com/posts.json', postData,
 {
   observe: 'response'/* if observe is body then response data we obtain is parsed to javascript object , and we get {name:string} */
  /* If observe is repsonse then the responseData is complete HTTP Response with all details like status,url,etc  but still will parse to javascript object
  but now inorder to access {name:string} , we will have to use responseData.body
  */
  }
 )
 .subscribe(
   responseData =>{
     console.log(responseData);/* If observe is body, so we can use responseData.body to access {name:string}
     If observe is response, then we can access headers using responseData.headers
     */
   }, error =>{
    this.error.next(error.message);
   }
 ); /* postData is converted into json and send to that url & returns observable which we need to subscribe*/
  }

  fetchPosts(){
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print','pretty');
    searchParams = searchParams.append('custom','key'); /* Multiple Http Params */

    return this.http.get<{[key:string]:Post}>('https://zomatoliteapp-default-rtdb.firebaseio.com/posts.json',
    {headers: new HttpHeaders({ 'Custom-Header':'Hello'}),
    //params: new HttpParams().set('print','pretty') /* for single Http param */
    params : searchParams, /* Result Request URl will be : https://zomatoliteapp-default-rtdb.firebaseio.com/posts.json?print=pretty&custom=key */
    responseType:'json' /* By Default responsetype will be json, Angular will parse responseData in json */
    /* responseType: 'text'  will not work as we get data of Post Type*/
  })
    .pipe(//  map( (responseData : {[key : string]: Post}) can also write like this or add type in http.get itself
      map( (responseData : {[key : string]: Post}) =>{/* rxjs operators to transform the data & the data obtained from url is in object form */
          const postsArray: Post[]=[];
          for(const key in responseData){ /* looping through array of objects */
            if(responseData.hasOwnProperty(key)){
            postsArray.push({...responseData[key], id: key}); /* pushing new object wih extra key as id into array */
          }
        }
        return postsArray;
      }),
      catchError(
        errorRes =>{
          //Send to analytics server
          return throwError(errorRes);
        }
      )
    )
    ;
  }

  deletePosts(){
    return this.http.delete('https://zomatoliteapp-default-rtdb.firebaseio.com/posts.json',
    {
      observe: 'events' /* We can have access to HTTP Events */
    }
    ).pipe(
     tap(event =>{  /* Without disturbing the normal flow , we can us tap to access the data */
       console.log(event);
       if(event.type === HttpEventType.Sent){
        /* we cannot access event.body here as event.type is sent */
       }
       if(event.type === HttpEventType.Response){
         console.log(event.body);
       }
     }

     )
    );
  }

}
