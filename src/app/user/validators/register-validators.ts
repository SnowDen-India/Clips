import { ValidationErrors ,AbstractControl, ValidatorFn} from "@angular/forms";

export class RegisterValidators {

    static match(controlName:string,matchingcontrolName:string):ValidatorFn{
        return (group:AbstractControl):ValidationErrors | null=>{
            const control = group.get(controlName)
            const matchingControl=group.get(matchingcontrolName)
       
            if(!control || !matchingControl){
               return {controlNotFound:false}
            }
       
            const error = control.value === matchingControl.value ? null : {noMatch:true}
             matchingControl.setErrors(error)    
            return error
        }
   
    }
}