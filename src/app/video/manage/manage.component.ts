import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute, Params} from '@angular/router';
import IClip from 'src/app/models/clip.model';
import { ClipsService } from 'src/app/services/clips.service';
import { ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  videoOrder='1'
  clips:IClip[]=[]
  activeClips:IClip | null =null;
  sort$:BehaviorSubject<string>
  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private clipService:ClipsService,
    private modal:ModalService
    ) { 
  this.sort$ = new BehaviorSubject(this.videoOrder)
  


    }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params:Params)=>{
       this.videoOrder =  params['sort'] == '2'? params['sort'] :'1'
       this.sort$.next(this.videoOrder)
    })
    this.clipService.getUserClips(this.sort$).subscribe(docs =>{
         this.clips=[]

         docs.forEach(doc =>{
            this.clips.push({
              docID:doc.id,
              ...doc.data()
            })
         })
    })
  }

  sort(event:Event){
   
    const {value} = (event.target as HTMLSelectElement)
     this.router.navigate([],{
      relativeTo:this.route,
      queryParams:{
        sort:value
      }
     })
    // this.router.navigateByUrl(`/manage?sort=${value}`)

  }
  openModal($event:Event,clip:IClip){
    $event.preventDefault();
    this.activeClips =clip
    this.modal.toggleModal('editClips')

  }

  update($event:IClip){

      this.clips.forEach((element,index)=>{
        if(element.docID==$event.docID){
          this.clips[index].title=$event.title
        }
      })
  }
   delete($event:Event,clip:IClip){
         this.clipService.deleteClips(clip)

         this.clips.forEach((element,index)=>{
          if(element.docID == clip.docID){
            this.clips.splice(index,1)
          }
         })
  }

async  copyToClipboard($event:MouseEvent,docId:string | undefined){
         $event.preventDefault()

         if(!docId){
             return
         }
        const url =`${location.origin}/clip/${docId}`
        await navigator.clipboard.writeText(url)
        alert('Link Copied')
  }
}
