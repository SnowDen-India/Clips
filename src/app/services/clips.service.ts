import { Injectable } from '@angular/core';
import { AngularFirestore,AngularFirestoreCollection,DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {  switchMap,map } from 'rxjs/operators';
import { of,BehaviorSubject,combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot ,Router} from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class ClipsService implements Resolve<IClip | null> {
   
  pageClips:IClip[]=[]
  pendingReq=false

  public clipsCollection:AngularFirestoreCollection<IClip>
  constructor(
    public db:AngularFirestore,
    private auth:AngularFireAuth,
    private storage:AngularFireStorage,
    private router:Router
  ) { 
       this.clipsCollection = db.collection('clips')

  }

   createClip(data:IClip):Promise<DocumentReference<IClip>>{

   return this.clipsCollection.add(data);

  }
  
  getUserClips(sort$:BehaviorSubject<string>){
    return combineLatest(
      [
        this.auth.user,
        sort$
      ]
      ).pipe(
      switchMap(values =>{
      
        const [user,sort] = values
          if(!user){
            return of([])
          }
        const query = this.clipsCollection.ref.where('uid','==',user.uid).orderBy(
          'timestamps',
          sort=='1'?'desc':'asc'
        )
        return query.get()
      }),

         map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)


    )
  


  }

  updateClips(id:string,title:string){
    return this.clipsCollection.doc(id).update({
      title
    })
  }

  async deleteClips(clip:IClip){
    // delete from the storage
       const clipRef = this.storage.ref(`clips/${clip.fileName}`)
       const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFileName}`)
       await clipRef.delete()
       await screenshotRef.delete()
    // delete from the collection

    await this.clipsCollection.doc(clip.docID).delete()

  }


 async getClips(){
   if(this.pendingReq){
    return
   }
 
   this.pendingReq=true

   let query = this.clipsCollection.ref.orderBy('timestamps','desc').limit(6);


    const {length}= this.pageClips;

    if(length){
      const lastDocId = this.pageClips[length-1].docID
      const lastDoc = await this.clipsCollection.doc(lastDocId).get().toPromise()

      query=query.startAfter(lastDoc)

    }

    const snapshot = await query.get()

       snapshot.forEach(doc=>{
          this.pageClips.push({
            docID:doc.id,
            ...doc.data()
          })
       })

    this.pendingReq=false

  }

resolve(route:ActivatedRouteSnapshot,state:RouterStateSnapshot){
     
  return this.clipsCollection.doc(route.params['id']).get().pipe(
    map(snapshot=>{
      const data = snapshot.data();

      if(!data){
        this.router.navigate(['/'])
        return null
      }
      return data
    })
  )
}


}
