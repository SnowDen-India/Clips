import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid'
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipsService } from 'src/app/services/clips.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragover = false
  file: File | null = null
  nextStep = false
  showAlert = false;
  alertColor = 'blue'
  showMsg = "Please wait ! You  clip is being uploded"
  inSubmission = false
  user: firebase.User | null = null
  task: AngularFireUploadTask
  screenshots: string[] = [];
  selectedScreenshots =''
  screenshotTask:AngularFireUploadTask
  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipsService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe(user => this.user = user)
    this.ffmpegService.init()
  }
  percentage = 0
  showPercantage = false
  ngOnDestroy(): void {
    this.task?.cancel()
  }

  title = new FormControl('',
    [
      Validators.required,
      Validators.minLength(3)
    ]
  )

  uploadForm = new FormGroup({
    title: this.title
  })


  async storeFile($event: Event) {
    if(this.ffmpegService.isRunning){
      return
    }
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }
    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
  this.selectedScreenshots = this.screenshots[0]
    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )

    this.nextStep = true

  }

 async uploadFile() {
    this.uploadForm.disable()
    this.showAlert = true;
    this.alertColor = 'blue'
    this.showMsg = "Please wait ! You clip is being uploded"
    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`
    this.showPercantage = true
    this.inSubmission=true

    const screenshotblob = await this.ffmpegService.blobFromUrl(this.selectedScreenshots)
      const screenshotPath =`screenshots/${clipFileName}.png`
  

    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)  //getting the reference of the of the file that is going to be upload
   
    this.screenshotTask=this.storage.upload(screenshotPath,screenshotblob)
    const screenshotRef=this.storage.ref(screenshotPath)
   
   
    combineLatest([this.task.percentageChanges(),this.screenshotTask.percentageChanges()]).subscribe((progress) => {
       const [clipProgress,screenshotProgress]=progress


            if(!clipProgress || !screenshotProgress){
              return
            }

          const total =clipProgress+screenshotProgress

      this.percentage = total as number / 200
    })

   forkJoin (
    [
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ]
    ).pipe(
      switchMap(() => forkJoin([
        clipRef.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ])
      )
    ).subscribe({
      next: async (urls) => {
        const [clipUrl,screenshotUrl]=urls
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url:clipUrl,
          screenshotUrl,
          screenshotFileName:`${clipFileName}.png`,
          timestamps: firebase.firestore.FieldValue.serverTimestamp()


        }

        const clipDocRef = await this.clipsService.createClip(clip)
        this.alertColor ='green'
        this.showMsg = "Success! Your clip is ready to share with world."
        this.showPercantage = false
        setTimeout(() => {
          this.router.navigate(['clip', clipDocRef.id])
        }, 1000)


      },
      error: (error) => {
        this.uploadForm.enable()
        this.alertColor = 'red'
        this.showMsg = 'Upload Failed! Please try again Later'
        this.inSubmission = false
      }
    })

  }

}
