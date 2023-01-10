import { Component, Input, OnDestroy, OnInit,OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { ClipsService } from 'src/app/services/clips.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit,OnDestroy,OnChanges{
@Input() activeClips:IClip | null =null
showAlert=false
inSubmission=false
alertColor='blue'
alertMsg='Please wait! updating clips'
@Output() update = new EventEmitter();
  constructor(
    private modal:ModalService,
    private clipService:ClipsService
  ) { }

  clipId = new FormControl('')

  title = new FormControl('',
  [
        Validators.required,
        Validators.minLength(3)
       ]
)

editForm = new FormGroup({
   title:this.title,
   clipId:this.clipId
})



  ngOnInit(): void {
    this.modal.register('editClips')

  }
  ngOnDestroy(): void {
     this.modal.unregister('editClips')
  }
  ngOnChanges(): void {
    if(!this.activeClips){
      return
    }
    this.inSubmission=false
    this.showAlert=false
  this.clipId.setValue(this.activeClips.docID)
  this.title.setValue(this.activeClips.title)


  }

  async submit(){
 

    this.showAlert=true
    this.inSubmission=true
    this.alertColor='blue'
    this.alertMsg='Please wait! updating clips.'
    try {
      await this.clipService.updateClips(this.clipId.value,this.title.value)
      this.alertColor='green'
      this.alertMsg='Please wait! updating clips.'

    } catch (error) {
      this.inSubmission=false
      this.alertColor='red'
      this.alertMsg='Something went wrong. try again later'
      return 
    }
    this.activeClips.title=this.title.value
    this.update.emit(this.activeClips)
    this.inSubmission=false
    this.alertColor='green'
    this.alertMsg='Success!.'
  
  }
}
