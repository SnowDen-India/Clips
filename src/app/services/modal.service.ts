import { Injectable } from '@angular/core';

interface IModal{
  id:string,
  visible:boolean
}


@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // visible=false;
  private modals:IModal[]=[];
  constructor() { }
  
    isModalOpen(id:string):boolean{
      return !!this.modals.find(element => element.id===id)?.visible
    }
    register(id:string){
         this.modals.push({
          id,
          visible:false
         })
    }

    unregister(id:string){
      this.modals = this.modals.filter(
        element => element.id !==id
      )
    }

    toggleModal(id:string){
      const modal= this.modals.find(element => element.id===id);
     
      if(modal){
        modal.visible=!modal.visible
      }
      // this.visible=!this.visible
    }


}
