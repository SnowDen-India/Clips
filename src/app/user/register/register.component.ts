import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import Iuser from 'src/app/models/user.model';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private auth:AuthService,private emailTaken:EmailTaken) { }

  inSubmission=false;

  name = new FormControl('', [Validators.required, Validators.minLength(3)])
  email = new FormControl('', [Validators.required, Validators.email],[this.emailTaken.validate])
  age = new FormControl<number | null>(null, [Validators.required, Validators.min(18), Validators.max(120)])
  password = new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)])
  confirm_password = new FormControl('', [Validators.required])
  phoneNumber = new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)])

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber

  },[RegisterValidators.match('password','confirm_password')])

  showAlert = false;
  alertMsg = "Please Wait! your account is being created."
  alertColor = 'blue'


  async register() {
    this.showAlert = true
    this.alertMsg = 'Please Wait! your account is being created.'
    this.alertColor = 'blue'
    this.inSubmission =true
    const { email, password } = this.registerForm.value;
    try {
      this.auth.createUser(this.registerForm.value as Iuser)

    } catch (e) {

 
       this.alertMsg='An unexpected error occured.Please try again later'
       this.alertColor='red'
       this.inSubmission=false
        return
    }

    this.alertMsg='Success! Your account has been created.'
    this.alertColor='green'


  }
}
